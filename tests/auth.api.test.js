// Login, password change and MoMo token routes, against the test database.
// Needs: NODE_ENV=test database created and migrated (see README).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import request from "supertest";
import bcrypt from "bcrypt";
// App modules are CommonJS: load them with require so the tests share the
// exact instances the app uses (an ESM import would load separate copies).
const require = createRequire(import.meta.url);
const app = require("../app");
const db = require("../server/models");

const { Users } = db;
const PASSWORD = "Start#12345";
let alice; // cashier
let bob; // store manager

async function login(username, password) {
  return request(app).post("/api/v1/auth").send({ username, password });
}

beforeAll(async () => {
  if (!process.env.jwtPrivateKey) process.env.jwtPrivateKey = "api_test_key";
  const hash = await bcrypt.hash(PASSWORD, 10);
  const base = { password: hash, status: true, first_login_flag: true };
  await Users.destroy({ where: { username: ["test_alice", "test_bob"] } });
  alice = await Users.create({ ...base, name: "Alice", username: "test_alice", profileid: 3 });
  bob = await Users.create({ ...base, name: "Bob", username: "test_bob", profileid: 1 });
});

afterAll(async () => {
  await Users.destroy({ where: { username: ["test_alice", "test_bob"] } });
  await db.sequelize.close();
});

describe("POST /auth", () => {
  it("returns a token for the right password", async () => {
    const res = await login("test_alice", PASSWORD);
    expect(res.status).toBe(200);
    expect(res.text.split(".")).toHaveLength(3);
  });

  it("rejects a wrong password", async () => {
    const res = await login("test_alice", "Wrong#12345");
    expect(res.status).toBe(400);
  });

  it("returned token is accepted by a protected route", async () => {
    const token = (await login("test_bob", PASSWORD)).text;
    const res = await request(app).get("/api/v1/user").set("x-auth-token", token);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("password");
  });
});

describe("PUT /auth/:userId (password change)", () => {
  const body = { password: "Changed#2026", confirmpassword: "Changed#2026" };

  it("returns 401 without a token", async () => {
    const res = await request(app).put(`/api/v1/auth/${alice.id}`).send(body);
    expect(res.status).toBe(401);
  });

  it("returns 403 when changing someone else's password", async () => {
    const token = (await login("test_alice", PASSWORD)).text;
    const res = await request(app)
      .put(`/api/v1/auth/${bob.id}`)
      .set("x-auth-token", token)
      .send(body);
    expect(res.status).toBe(403);
    expect((await login("test_bob", PASSWORD)).status).toBe(200);
  });

  it("returns 400 when the two passwords differ", async () => {
    const token = (await login("test_alice", PASSWORD)).text;
    const res = await request(app)
      .put(`/api/v1/auth/${alice.id}`)
      .set("x-auth-token", token)
      .send({ password: "Changed#2026", confirmpassword: "Other#2026" });
    expect(res.status).toBe(400);
  });

  it("changes your own password and clears first_login_flag", async () => {
    const token = (await login("test_alice", PASSWORD)).text;
    const res = await request(app)
      .put(`/api/v1/auth/${alice.id}`)
      .set("x-auth-token", token)
      .send(body);
    expect(res.status).toBe(200);
    expect((await login("test_alice", PASSWORD)).status).toBe(400);
    expect((await login("test_alice", body.password)).status).toBe(200);
    await alice.reload();
    expect(alice.first_login_flag).toBe(false);
  });
});

describe("POST /generatetoken (MoMo)", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/v1/generatetoken");
    expect(res.status).toBe(401);
  });

  it("returns 502 (not a hang) when MoMo cannot be reached", async () => {
    const saved = process.env.MoMoURL;
    process.env.MoMoURL = "http://127.0.0.1:9/"; // nothing listens here
    try {
      const token = (await login("test_bob", PASSWORD)).text;
      const res = await request(app)
        .post("/api/v1/generatetoken")
        .set("x-auth-token", token);
      expect(res.status).toBe(502);
    } finally {
      process.env.MoMoURL = saved;
    }
  });
});

describe("models/index.js", () => {
  it("fails with a clear message for an environment with no config", () => {
    let output = "";
    try {
      execFileSync(process.execPath, ["-e", 'require("./server/models")'], {
        env: { ...process.env, NODE_ENV: "staging" },
        stdio: "pipe",
      });
    } catch (error) {
      output = String(error.stderr);
    }
    expect(output).toContain('No database configuration for NODE_ENV="staging"');
  });
});
