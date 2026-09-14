import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";
import Product from "../model/Product.js";
import adminRouter from "./admin.Route.js";

test("product admins manage the catalog but not accounts; full admin manages staff", async t => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "admin-route-test-secret";
  const adminId = "507f1f77bcf86cd799439001";
  const staffId = "507f1f77bcf86cd799439002";
  const roles = { [adminId]: "admin", [staffId]: "product_admin" };
  let staffRecord = null;

  t.mock.method(User, "findById", id => ({ select: () => Promise.resolve(roles[id] ? { role: roles[id] } : null) }));
  t.mock.method(User, "countDocuments", async () => 2);
  t.mock.method(Product, "countDocuments", async () => 1);
  t.mock.method(Product, "find", () => ({ sort: () => Promise.resolve([]) }));
  t.mock.method(User, "find", () => ({ select: () => ({ sort: () => ({ limit: () => Promise.resolve([]) }) }) }));
  t.mock.method(User, "findOne", ({ email }) => ({ collation: () => Promise.resolve(staffRecord?.email === email ? staffRecord : null) }));
  t.mock.method(User, "create", async data => { staffRecord = { ...data, _id: staffId }; return staffRecord; });
  t.mock.method(User, "findOneAndDelete", async ({ _id, role }) => {
    if (staffRecord && String(staffRecord._id) === String(_id) && staffRecord.role === role) { const removed = staffRecord; staffRecord = null; return removed; }
    return null;
  });
  t.mock.method(User, "findOneAndUpdate", async ({ _id, role }, update) => {
    if (staffRecord && String(staffRecord._id) === String(_id) && staffRecord.role === role) { staffRecord = { ...staffRecord, ...update }; return staffRecord; }
    return null;
  });

  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/admin", adminRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  const adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET);
  const staffToken = jwt.sign({ id: staffId }, process.env.JWT_SECRET);
  const call = (path, method, token, body) => fetch(base + path, {
    method, headers: { "Content-Type": "application/json", Cookie: `token=${token}`, Origin: "http://localhost:5173" }, body: body && JSON.stringify(body),
  });

  try {
    // product admin can reach the dashboard and catalog
    assert.equal((await call("/overview", "GET", staffToken)).status, 200);
    assert.equal((await call("/products", "GET", staffToken)).status, 200);
    // product admin cannot see the account list or create/revoke staff
    assert.equal((await call("/users", "GET", staffToken)).status, 403);
    assert.equal((await call("/staff", "POST", staffToken, { name: "New Staff", email: "new@example.com", password: "Password123!" })).status, 403);

    // full admin can do everything the product admin can, plus manage staff
    assert.equal((await call("/overview", "GET", adminToken)).status, 200);
    assert.equal((await call("/users", "GET", adminToken)).status, 200);

    const created = await call("/staff", "POST", adminToken, { name: "New Staff", email: "new@example.com", password: "Password123!" });
    assert.equal(created.status, 201);
    const { staff } = await created.json();
    assert.equal(staff.role, "product_admin");
    assert.equal(staff.password, undefined);

    assert.equal((await call("/staff", "POST", adminToken, { name: "Dup", email: "new@example.com", password: "Password123!" })).status, 409);
    assert.equal((await call("/staff", "POST", adminToken, { name: "", email: "bad", password: "short" })).status, 400);

    // password reset: staff cannot reset their own or anyone's password; admin can
    assert.equal((await call(`/staff/${staff._id}/password`, "PUT", staffToken, { password: "NewPassword123!" })).status, 403);
    assert.equal((await call(`/staff/${staff._id}/password`, "PUT", adminToken, { password: "short" })).status, 400);
    const reset = await call(`/staff/${staff._id}/password`, "PUT", adminToken, { password: "NewPassword123!" });
    assert.equal(reset.status, 200);
    assert.notEqual(staffRecord.password, "NewPassword123!"); // stored hashed, not plaintext
    assert.equal((await call("/staff/507f1f77bcf86cd799439099/password", "PUT", adminToken, { password: "NewPassword123!" })).status, 404);

    assert.equal((await call(`/staff/${staff._id}`, "DELETE", staffToken)).status, 403); // product admin cannot revoke staff
    assert.equal((await call(`/staff/${staff._id}`, "DELETE", adminToken)).status, 200);
    assert.equal((await call(`/staff/${staff._id}`, "DELETE", adminToken)).status, 404); // already removed
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;
  }
});
