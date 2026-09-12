import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../model/User.modal.js";
import { googleLogin, googleConfig } from "../controller/google.Controller.js";

test("Google sign-in verifies credentials, creates customer accounts and protects existing identities", async t => {
  const old = { id: process.env.GOOGLE_CLIENT_ID, secret: process.env.JWT_SECRET };
  process.env.GOOGLE_CLIENT_ID = "test.apps.googleusercontent.com";
  process.env.JWT_SECRET = "test-google-session-secret";
  let payload = { sub: "google-sub", email: "new@gmail.com", email_verified: true, name: "Google Customer" };
  let linked = null;
  let existing = null;
  let created;
  const verify = t.mock.method(OAuth2Client.prototype, "verifyIdToken", async options => {
    assert.equal(options.audience, process.env.GOOGLE_CLIENT_ID);
    if (options.idToken === "bad-token") throw new Error("Invalid signature or audience");
    return { getPayload: () => payload };
  });
  t.mock.method(User, "findOne", query => query.googleId ? Promise.resolve(linked) : { collation: () => Promise.resolve(existing) });
  t.mock.method(User, "create", async data => { created = { ...data, _id: "507f1f77bcf86cd799439011" }; return created; });
  t.mock.method(User, "findOneAndUpdate", async (query, update) => {
    assert.deepEqual(query.googleId, { $exists: false });
    return { ...existing, googleId: update.$set.googleId };
  });
  const app = express();
  app.use(express.json());
  app.get("/config", googleConfig);
  app.post("/google", googleLogin);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (credential, origin = process.env.FRONTEND_URL || "http://localhost:5173") => fetch(base + "/google", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ credential, role: "admin" }) });
  try {
    assert.equal((await post("token", "https://untrusted.example")).status, 403);
    assert.equal(verify.mock.callCount(), 0);
    assert.equal((await post(null)).status, 400);
    assert.equal((await post("bad-token")).status, 401);
    const success = await post("token");
    assert.equal(success.status, 200);
    assert.match(success.headers.get("set-cookie"), /HttpOnly/);
    assert.equal(created.googleId, "google-sub");
    assert.equal(created.role, "user");
    assert.equal(created.password, undefined);
    linked = created;
    assert.equal((await post("token")).status, 200);
    linked = null;
    existing = { ...created, googleId: undefined, password: "hash", role: "admin" };
    assert.equal((await post("token")).status, 409);
    existing.role = "user";
    payload.email = "thirdparty@example.com";
    assert.equal((await post("token")).status, 409);
    payload.email = "new@gmail.com";
    assert.equal((await post("token")).status, 200);
    payload.email_verified = false;
    assert.equal((await post("token")).status, 401);
    delete process.env.GOOGLE_CLIENT_ID;
    assert.equal((await post("token")).status, 503);
    assert.equal((await (await fetch(base + "/config")).json()).clientId, null);
  } finally {
    await new Promise(resolve => server.close(resolve));
    for (const [key, value] of [["GOOGLE_CLIENT_ID", old.id], ["JWT_SECRET", old.secret]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
