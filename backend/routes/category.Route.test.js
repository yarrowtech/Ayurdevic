import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import Category from "../model/Category.js";
import categoryRouter from "./category.Route.js";

test("category routes create, hide, rename without changing key, and delete without touching products", async t => {
  const id = "507f1f77bcf86cd799439011";
  let stored;
  t.mock.method(Category, "create", async data => { stored = { ...data, _id: id }; return stored; });
  t.mock.method(Category, "findByIdAndUpdate", async (categoryId, data) => {
    assert.equal(categoryId, id);
    stored = { ...stored, ...data };
    return stored;
  });
  t.mock.method(Category, "findByIdAndDelete", async () => { const previous = stored; stored = null; return previous; });
  const app = express();
  app.use(express.json());
  app.use("/categories", categoryRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/categories`;
  const write = (path, method, body) => fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    const created = await write("", "POST", { name: "Herbal Oils", visible: true });
    assert.equal(created.status, 201);
    assert.equal((await created.json()).category.key, "herbal oils");
    const updated = await write(`/${id}`, "PUT", { name: "Body Oils", visible: false, offer: "Summer sale", key: "wrong" });
    assert.equal(updated.status, 200);
    const { category } = await updated.json();
    assert.equal(category.key, "herbal oils");
    assert.equal(category.visible, false);
    assert.equal(category.offer, "Summer sale");
    assert.equal((await write("/invalid", "PUT", {})).status, 400);
    assert.equal((await fetch(`${base}/${id}`, { method: "DELETE" })).status, 200);
    assert.equal(stored, null);
    assert.equal((await fetch(`${base}/${id}`, { method: "DELETE" })).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
