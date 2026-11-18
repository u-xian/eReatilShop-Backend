// Errors in async handlers must become HTTP responses, never a crash or a hang.
// Needs the test database (see README).
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { createRequire } from "node:module";
import request from "supertest";
import bcrypt from "bcrypt";
// App modules are CommonJS: load them with require so the tests share the
// exact instances the app uses (an ESM import would load separate copies).
const require = createRequire(import.meta.url);
const app = require("../app");
const db = require("../server/models");
const { asyncHandler } = require("../server/middleware/asyncHandler");

const { Users, Clients, Products } = db;
const PASSWORD = "Start#12345";
let token; // store manager
let product;

beforeAll(async () => {
  if (!process.env.jwtPrivateKey) process.env.jwtPrivateKey = "api_test_key";
  await Users.destroy({ where: { username: "test_errors_sm" } });
  await Users.create({
    name: "Errors SM",
    username: "test_errors_sm",
    password: await bcrypt.hash(PASSWORD, 10),
    profileid: 1,
    status: true,
    first_login_flag: false,
  });
  product = await Products.create({
    productname: "Test product",
    productnumber: "TP-ERR",
    startinginventory: 10,
    inventoryshipped: 0,
    inventoryonhand: 10,
    minimumurequired: 1,
    buyingPrice: 1.5,
    sellingPrice: 2.5,
    categoryId: 1,
  });
  const res = await request(app)
    .post("/api/v1/auth")
    .send({ username: "test_errors_sm", password: PASSWORD });
  token = res.text;
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await Users.destroy({ where: { username: "test_errors_sm" } });
  await Clients.destroy({ where: { email: "errors.test@example.com" } });
  await product.destroy();
  await db.sequelize.close();
});

describe("asyncHandler", () => {
  it("passes a rejected promise to next()", async () => {
    const boom = new Error("boom");
    const next = vi.fn();
    await asyncHandler(async () => {
      throw boom;
    })({}, {}, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe("bad input gets a 4xx response", () => {
  it.each([
    ["GET", "/api/v1/clients/abc"],
    ["GET", "/api/v1/products/categ/xyz"],
    ["DELETE", "/api/v1/user/abc"],
  ])("%s %s returns 400", async (method, url) => {
    const res = await request(app)[method.toLowerCase()](url).set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("an id out of integer range returns 400", async () => {
    const res = await request(app)
      .post("/api/v1/sale")
      .set("x-auth-token", token)
      .send({ productId: 1, sales: 1, price: 2, orderId: 99999999999 });
    expect(res.status).toBe(400);
  });

  it("malformed JSON returns 400 with a plain message", async () => {
    const res = await request(app)
      .post("/api/v1/auth")
      .set("content-type", "application/json")
      .send('{"username":');
    expect(res.status).toBe(400);
    expect(res.text).toBe("Invalid JSON in request body.");
  });

  it.each([{ sales: "abc" }, { sales: -3 }, {}])(
    "updateproductcount rejects %j without changing stock",
    async (body) => {
      const res = await request(app)
        .put(`/api/v1/products/updateproductcount/${product.id}`)
        .set("x-auth-token", token)
        .send(body);
      expect(res.status).toBe(400);
      await product.reload();
      expect(product.inventoryonhand).toBe(10);
    },
  );
});

describe("unexpected errors", () => {
  it("return 500 without leaking details, and the next request still works", async () => {
    vi.spyOn(Clients, "findAll").mockRejectedValueOnce(new Error("secret db detail"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = await request(app).get("/api/v1/clients").set("x-auth-token", token);
    expect(failed.status).toBe(500);
    expect(failed.text).not.toContain("secret");

    const ok = await request(app).get("/api/v1/clients").set("x-auth-token", token);
    expect(ok.status).toBe(200);
  });
});

describe("creating records", () => {
  it("POST /clients creates a client", async () => {
    const res = await request(app)
      .post("/api/v1/clients")
      .set("x-auth-token", token)
      .send({
        name: "Errors Test",
        address: "12 Main Street",
        phone: "0788000000",
        email: "errors.test@example.com",
      });
    expect(res.status).toBe(200);
    expect(await Clients.count({ where: { email: "errors.test@example.com" } })).toBe(1);
  });
});
