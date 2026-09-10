import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";
import userRouter from "./user.Route.js";
import authUser from "../middleware/authUser.js";

test("session status supports guests and expired sessions while protected routes reject them", async t => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "session-test-secret-only";
  const user = { _id: "507f1f77bcf86cd799439011", name: "Test", role: "user" };
  let foundUser = user;
  t.mock.method(User, "findById", () => ({ select: fields => {
    assert.equal(fields, "-password");
    return Promise.resolve(foundUser);
  } }));
  const app = express();
  app.use(cookieParser());
  app.use("/api/user", userRouter);
  app.get("/protected", authUser, (req, res) => res.json({ ok: true }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = (path, token) => fetch(base + path, { headers: token ? { Cookie: `token=${token}` } : {} });
  try {
    const expired = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: -1 });
    for (const token of [undefined, "invalid-token", expired]) {
      const response = await get("/api/user/is-auth", token);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { success: true, user: null });
      assert.equal((await get("/protected", token)).status, 401);
    }
    const valid = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    assert.deepEqual(await (await get("/api/user/is-auth", valid)).json(), { success: true, user });
    foundUser = null;
    assert.deepEqual(await (await get("/api/user/is-auth", valid)).json(), { success: true, user: null });
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
