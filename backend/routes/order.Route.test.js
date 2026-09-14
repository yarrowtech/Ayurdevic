import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";
import Product from "../model/Product.js";
import Order from "../model/Order.js";
import userRouter from "./user.Route.js";

test("order routes require auth, validate the request, price server-side, and list a user's orders", async t => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "order-route-test-secret";
  const userId = "507f1f77bcf86cd799439011";
  const addressId = "507f1f77bcf86cd799439012";
  const productId = "507f1f77bcf86cd799439013";
  const address = { _id: addressId, label: "Home", line1: "221B Baker Street", line2: "", city: "Mumbai", state: "MH", postalCode: "400001", country: "India", phone: "+919876543210" };
  const addresses = [address];
  addresses.id = id => addresses.find(item => String(item._id) === String(id));
  const user = { _id: userId, addresses };
  const product = { _id: productId, name: "TITAN", offerPrice: 1500, image: ["http://example.com/titan.jpg"], inStock: true };

  t.mock.method(User, "findById", () => Promise.resolve(user));
  t.mock.method(Product, "findById", id => Promise.resolve(String(id) === productId ? product : null));
  let created;
  t.mock.method(Order, "create", async data => { created = { ...data, _id: "507f1f77bcf86cd799439099" }; return created; });
  t.mock.method(Order, "find", () => ({ sort: () => Promise.resolve(created ? [created] : []) }));

  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/user", userRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/user/orders`;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  const call = (method, body) => fetch(base, { method, headers: { "Content-Type": "application/json", Cookie: `token=${token}` }, body: body && JSON.stringify(body) });
  const validBody = { items: [{ productId, quantity: 2 }], addressId, paymentMethod: "COD" };

  try {
    assert.equal((await fetch(base)).status, 401); // no cookie

    assert.equal((await call("POST", { ...validBody, items: [] })).status, 400);
    assert.equal((await call("POST", { ...validBody, addressId: "not-an-id" })).status, 400);
    assert.equal((await call("POST", { ...validBody, addressId: "507f1f77bcf86cd799439099" })).status, 400); // address not on this user
    assert.equal((await call("POST", { ...validBody, items: [{ productId: "507f1f77bcf86cd799439098", quantity: 1 }] })).status, 409); // unknown product

    const placed = await call("POST", validBody);
    assert.equal(placed.status, 201);
    const { order } = await placed.json();
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].price, 1500);
    assert.equal(order.subtotal, 3000);
    assert.equal(order.tax, 60);
    assert.equal(order.total, 3060);
    assert.equal(order.address.city, "Mumbai");

    const list = await (await call("GET")).json();
    assert.equal(list.orders.length, 1);
    assert.equal(list.orders[0].total, 3060);
    product.extraDiscountPercent = 10;
    const discounted = await call("POST", { ...validBody, extraDiscountPercent: 100, price: 0 });
    assert.equal(discounted.status, 201);
    const discountedOrder = (await discounted.json()).order;
    assert.equal(discountedOrder.items[0].price, 1350);
    assert.equal(discountedOrder.subtotal, 2700);
    assert.equal(discountedOrder.tax, 54);
    assert.equal(discountedOrder.total, 2754);
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;
  }
});
