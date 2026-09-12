import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "../model/User.modal.js";
import userRouter from "./user.Route.js";
import authUser from "../middleware/authUser.js";
import authAdmin from "../middleware/authAdmin.js";

test("customer registration, duplicate handling, login, session and logout", async t => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "account-lifecycle-test-secret";
  let stored;
  t.mock.method(User, "findOne", ({ email }) => ({ collation: () => Promise.resolve(stored?.email === email ? stored : null) }));
  t.mock.method(User, "create", async data => { stored = { ...data, _id: "507f1f77bcf86cd799439011" }; return stored; });
  t.mock.method(User, "findById", () => ({ select: fields => {
    if (fields === "role") return Promise.resolve({ role: stored.role });
    const { password, ...safe } = stored;
    return Promise.resolve(safe);
  } }));
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/user", userRouter);
  app.get("/admin-only", authUser, authAdmin, (req, res) => res.json({ ok: true }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(`${base}/api/user/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    const account = { name: "  Customer Test  ", email: "  CUSTOMER@example.com ", password: "TestPassword123!", role: "admin" };
    for (const change of [{ name: " " }, { email: "bad-email" }, { password: "short" }, { password: "a".repeat(73) }, { email: {} }]) {
      assert.equal((await post("register", { ...account, ...change })).status, 400);
    }
    const registered = await post("register", account);
    assert.equal(registered.status, 201);
    const data = await registered.json();
    assert.equal(data.user.role, "user");
    assert.equal(data.user.email, "customer@example.com");
    assert.equal(data.user.name, "Customer Test");
    assert.equal(data.user.password, undefined);
    assert.notEqual(stored.password, account.password);
    assert.equal(await bcrypt.compare(account.password, stored.password), true);
    assert.match(registered.headers.get("set-cookie"), /HttpOnly/i);
    assert.equal((await post("register", account)).status, 409);
    assert.equal((await post("login", { email: account.email, password: "incorrect" })).status, 401);
    assert.equal((await post("login", { email: {}, password: "incorrect" })).status, 400);
    const login = await post("login", { email: "CUSTOMER@example.com", password: account.password });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const session = await fetch(`${base}/api/user/is-auth`, { headers: { Cookie: cookie } });
    assert.equal((await session.json()).user.email, "customer@example.com");
    assert.equal((await fetch(`${base}/admin-only`, { headers: { Cookie: cookie } })).status, 403);
    const logout = await fetch(`${base}/api/user/logout`, { headers: { Cookie: cookie } });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/i);
    assert.equal((await (await fetch(`${base}/api/user/is-auth`)).json()).user, null);
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previous === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous;
  }
});
