// Token signing (services/generateAuthenticationToken) and checking
// (middleware/auth) must agree. No database needed.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import generateAuthToken from "../server/services/generateAuthenticationToken";
import auth from "../server/middleware/auth";
import profileCheck from "../server/middleware/profileCheck";

const KEY = "unit_test_key";
let savedKey;

beforeEach(() => {
  savedKey = process.env.jwtPrivateKey;
  process.env.jwtPrivateKey = KEY;
});
afterEach(() => {
  process.env.jwtPrivateKey = savedKey;
});

// Runs a middleware with a fake req/res and reports what it did.
function run(middleware, { token, user } = {}) {
  const req = { header: (name) => (name === "x-auth-token" ? token : undefined), user };
  const result = { nextCalled: false, status: null, body: null, req };
  const res = {
    status(code) {
      result.status = code;
      return this;
    },
    send(body) {
      result.body = body;
      return this;
    },
  };
  middleware(req, res, () => {
    result.nextCalled = true;
  });
  return result;
}

describe("generateAuthToken", () => {
  it("signs HS256 tokens that expire after one hour", () => {
    const token = generateAuthToken({ userid: 1, profileid: 1 });
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header.alg).toBe("HS256");
    expect(decoded.payload.exp - decoded.payload.iat).toBe(3600);
  });
});

describe("auth middleware", () => {
  it("accepts a token made by generateAuthToken and sets req.user", () => {
    const token = generateAuthToken({ userid: 7, profileid: 3 });
    const r = run(auth, { token });
    expect(r.nextCalled).toBe(true);
    expect(r.req.user).toMatchObject({ userid: 7, profileid: 3 });
  });

  it("returns 401 without a token", () => {
    const r = run(auth);
    expect(r.nextCalled).toBe(false);
    expect(r.status).toBe(401);
  });

  it("returns 400 for a token signed with another key", () => {
    const token = jwt.sign({ userid: 1, profileid: 1 }, "other_key");
    const r = run(auth, { token });
    expect(r.nextCalled).toBe(false);
    expect(r.status).toBe(400);
  });

  it("returns 400 for an unsigned (alg: none) token", () => {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const token = `${b64({ alg: "none", typ: "JWT" })}.${b64({ userid: 1, profileid: 1 })}.`;
    const r = run(auth, { token });
    expect(r.nextCalled).toBe(false);
    expect(r.status).toBe(400);
  });

  it("returns 403 for an expired token", () => {
    const token = jwt.sign({ userid: 1, profileid: 1 }, KEY, { expiresIn: -10 });
    const r = run(auth, { token });
    expect(r.nextCalled).toBe(false);
    expect(r.status).toBe(403);
  });

  it("refuses every request (500) when jwtPrivateKey is not set", () => {
    const token = generateAuthToken({ userid: 1, profileid: 1 });
    delete process.env.jwtPrivateKey;
    const r = run(auth, { token });
    expect(r.nextCalled).toBe(false);
    expect(r.status).toBe(500);
  });
});

describe("profile checks never pass without a user", () => {
  it.each(["isStoreManager", "isInventoryManager", "isCashier"])(
    "%s returns 401 when req.user is missing, even with no jwtPrivateKey",
    (name) => {
      delete process.env.jwtPrivateKey;
      const r = run(profileCheck[name]);
      expect(r.nextCalled).toBe(false);
      expect(r.status).toBe(401);
    },
  );

  it("isStoreManager lets profile 1 through and blocks profile 3", () => {
    expect(run(profileCheck.isStoreManager, { user: { profileid: 1 } }).nextCalled).toBe(true);
    expect(run(profileCheck.isStoreManager, { user: { profileid: 3 } }).status).toBe(403);
  });
});
