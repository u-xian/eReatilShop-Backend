// MoMo payment routes against a fake MoMo server (no network needed).
// The MoMo access token must stay on the server. Needs the test database.
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { createRequire } from "node:module";
import express from "express";
import request from "supertest";
import bcrypt from "bcrypt";
// App modules are CommonJS: load them with require so the tests share the
// exact instances the app uses (an ESM import would load separate copies).
const require = createRequire(import.meta.url);
const app = require("../app");
const db = require("../server/models");
const { clearMomoTokenCache } = require("../server/services/CreateTokenAPI");

const { Users } = db;
const PASSWORD = "Start#12345";
const PAYMENT = {
  amount: "100",
  currency: "EUR",
  externalId: "ext-1",
  phone: "46733123453",
  payerMessage: "hi",
  payeeNote: "note",
};

// Fake MoMo: issues numbered tokens and only accepts the latest one.
const momo = { tokensIssued: 0, validToken: null, payments: {} };
let momoServer;
let savedMoMoURL;
let token; // cashier

function startFakeMomo() {
  const fake = express();
  fake.use(express.json());
  const authorized = (req, res) => {
    if (req.get("Authorization") === `Bearer ${momo.validToken}`) return true;
    res.sendStatus(401);
    return false;
  };
  fake.post("/v1_0/apiuser", (req, res) => res.sendStatus(201));
  fake.post("/v1_0/apiuser/:id/apikey", (req, res) => res.status(201).json({ apiKey: "KEY" }));
  fake.post("/collection/token/", (req, res) => {
    momo.tokensIssued += 1;
    momo.validToken = `MOMO_SECRET_TOKEN_${momo.tokensIssued}`;
    res.json({ access_token: momo.validToken, token_type: "access_token", expires_in: 3600 });
  });
  fake.post("/collection/v1_0/requesttopay", (req, res) => {
    if (!authorized(req, res)) return;
    momo.payments[req.get("X-Reference-Id")] = req.body;
    res.sendStatus(202);
  });
  fake.get("/collection/v1_0/requesttopay/:id", (req, res) => {
    if (!authorized(req, res)) return;
    const payment = momo.payments[req.params.id];
    if (!payment) return res.sendStatus(404);
    res.json({ ...payment, status: "SUCCESSFUL" });
  });
  return new Promise((resolve) => {
    const server = fake.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const pay = () =>
  request(app).post("/api/v1/momopay/pay").set("x-auth-token", token).send(PAYMENT);
const status = (body) =>
  request(app).post("/api/v1/momopay/transactionstatus").set("x-auth-token", token).send(body);

beforeAll(async () => {
  if (!process.env.jwtPrivateKey) process.env.jwtPrivateKey = "api_test_key";
  momoServer = await startFakeMomo();
  savedMoMoURL = process.env.MoMoURL;
  process.env.MoMoURL = `http://127.0.0.1:${momoServer.address().port}/`;

  await Users.destroy({ where: { username: "test_momo_cashier" } });
  await Users.create({
    name: "Momo Cashier",
    username: "test_momo_cashier",
    password: await bcrypt.hash(PASSWORD, 10),
    profileid: 3,
    status: true,
    first_login_flag: false,
  });
  token = (
    await request(app)
      .post("/api/v1/auth")
      .send({ username: "test_momo_cashier", password: PASSWORD })
  ).text;
});

beforeEach(() => {
  clearMomoTokenCache();
  momo.tokensIssued = 0;
  momo.validToken = null;
});

afterAll(async () => {
  process.env.MoMoURL = savedMoMoURL;
  await new Promise((resolve) => momoServer.close(resolve));
  await Users.destroy({ where: { username: "test_momo_cashier" } });
  await db.sequelize.close();
});

describe("POST /momopay/pay", () => {
  it("returns only the payment reference, never the MoMo token", async () => {
    const res = await pay();
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data)).toEqual(["uuid"]);
    expect(res.text).not.toContain("MOMO_SECRET_TOKEN");
    expect(JSON.stringify(res.headers)).not.toContain("MOMO_SECRET_TOKEN");
    expect(momo.payments[res.body.data.uuid]).toMatchObject({ amount: "100" });
  });

  it("reuses one MoMo token for several payments", async () => {
    await pay();
    await pay();
    expect(momo.tokensIssued).toBe(1);
  });
});

describe("POST /momopay/transactionstatus", () => {
  it("works with only the payment reference from the client", async () => {
    const { uuid } = (await pay()).body.data;
    const res = await status({ uuid_user: uuid });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SUCCESSFUL");
    expect(momo.tokensIssued).toBe(1);
  });

  it("ignores an authToken sent by older clients", async () => {
    const { uuid } = (await pay()).body.data;
    const res = await status({ uuid_user: uuid, authToken: "Bearer junk" });
    expect(res.status).toBe(200);
  });

  it("returns 404 for an unknown reference", async () => {
    const res = await status({ uuid_user: "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b" });
    expect(res.status).toBe(404);
  });

  it("returns 400 when the reference is not a UUID", async () => {
    const res = await status({ uuid_user: "../../v1_0/apiuser" });
    expect(res.status).toBe(400);
  });

  it("gets a new token after MoMo rejects the cached one", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { uuid } = (await pay()).body.data;
    momo.validToken = "ROTATED"; // MoMo no longer accepts the cached token
    expect((await status({ uuid_user: uuid })).status).toBe(502);
    expect((await status({ uuid_user: uuid })).status).toBe(200);
    expect(momo.tokensIssued).toBe(2);
    vi.restoreAllMocks();
  });
});

describe("MoMo unreachable", () => {
  it("pay and status return 502 instead of hanging or crashing", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const url = process.env.MoMoURL;
    process.env.MoMoURL = "http://127.0.0.1:9/"; // nothing listens here
    try {
      expect((await pay()).status).toBe(502);
      const res = await status({ uuid_user: "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b" });
      expect(res.status).toBe(502);
      // Logs must not contain the subscription key or a token.
      const logged = JSON.stringify(errors.mock.calls);
      expect(logged).not.toContain("MOMO_SECRET_TOKEN");
      if (process.env.MoMoSubscriptionKey)
        expect(logged).not.toContain(process.env.MoMoSubscriptionKey);
    } finally {
      process.env.MoMoURL = url;
      vi.restoreAllMocks();
    }
  });
});
