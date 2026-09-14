import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";
import userRouter from "./user.Route.js";

// Minimal stand-in for a Mongoose DocumentArray: supports the .id()/.pull()
// calls the routes make, on top of plain array push/forEach/some.
function addressList(initial = []) {
  const list = [...initial];
  let nextId = 1;
  list.id = id => list.find(item => String(item._id) === String(id));
  list.pull = ({ _id }) => { const index = list.findIndex(item => String(item._id) === String(_id)); if (index !== -1) list.splice(index, 1); };
  const rawPush = list.push.bind(list);
  list.push = item => rawPush({ _id: String(nextId++).padStart(24, "0"), ...item });
  return list;
}

test("address routes require auth, enforce a single default, and support CRUD", async t => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "address-route-test-secret";
  const userId = "507f1f77bcf86cd799439011";
  const user = { _id: userId, addresses: addressList(), save: async () => {} };
  t.mock.method(User, "findById", () => Promise.resolve(user));
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/user", userRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/user/addresses`;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  const call = (path, method, body) => fetch(base + path, { method, headers: { "Content-Type": "application/json", Cookie: `token=${token}` }, body: body && JSON.stringify(body) });
  const valid = { line1: "221B Baker Street", city: "Mumbai", state: "MH", postalCode: "400001", phone: "9876543210" };
  try {
    assert.equal((await fetch(base)).status, 401); // no cookie

    assert.equal((await call("", "GET")).status, 200);
    assert.equal((await call("", "POST", { ...valid, line1: "" })).status, 400);
    for (const phone of ["987654321", "98765432101", "+919876543210", "98765abcde", "98765 4321"]) {
      assert.equal((await call("", "POST", { ...valid, phone })).status, 400);
    }

    const first = await call("", "POST", valid);
    assert.equal(first.status, 201);
    let body = await first.json();
    assert.equal(body.addresses.length, 1);
    assert.equal(body.addresses[0].isDefault, true); // first address defaults on

    const second = await call("", "POST", { ...valid, label: "Work", line1: "42 Market Road", isDefault: true });
    body = await second.json();
    assert.equal(body.addresses.length, 2);
    assert.equal(body.addresses[0].isDefault, false); // switching default clears the old one
    assert.equal(body.addresses[1].isDefault, true);

    const secondId = body.addresses[1]._id;
    assert.equal((await call(`/${secondId}`, "PUT", { ...valid, phone: "98765432101" })).status, 400);
    assert.equal((await call(`/${secondId}`, "PUT", { ...valid, city: "Pune" })).status, 200);
    const updated = await (await call("", "GET")).json();
    assert.equal(updated.addresses[1].city, "Pune");

    assert.equal((await call("/not-an-id", "PUT", valid)).status, 400);
    assert.equal((await call("/507f1f77bcf86cd799439099", "DELETE")).status, 404);

    const firstId = updated.addresses[0]._id;
    assert.equal((await call(`/${firstId}`, "DELETE")).status, 200);
    const afterDelete = await (await call("", "GET")).json();
    assert.equal(afterDelete.addresses.length, 1);
    assert.equal(afterDelete.addresses[0].isDefault, true); // deleting the default promotes the remaining address
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;
  }
});
