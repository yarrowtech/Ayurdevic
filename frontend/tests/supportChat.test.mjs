import { test } from "node:test";
import assert from "node:assert/strict";
import { getSupportReply } from "../src/services/supportChat.js";

test("order questions use the newest saved order, not a fabricated status", async () => {
  const reply = await getSupportReply("Track my order", { getOrders: async () => ({ orders: [
    { createdAt: "2026-01-01", status: "Delivered", items: [{ name: "Older item" }] },
    { createdAt: "2026-09-01", status: "Shipped", items: [{ name: "New item" }] },
  ] }) });
  assert.match(reply.text, /New item/);
  assert.match(reply.text, /Shipped/);
  assert.doesNotMatch(reply.text, /Delivered/);
  assert.equal(reply.actions[0].to, "/account?tab=orders");
});

test("empty, failed, and malformed order responses have useful replies", async () => {
  assert.match((await getSupportReply("order status", { getOrders: async () => ({ orders: [] }) })).text, /don't have any orders/);
  for (const getOrders of [async () => { throw new Error("offline"); }, async () => ({})]) {
    assert.match((await getSupportReply("delivery", { getOrders })).text, /couldn't load/);
  }
});

test("common questions route to help without unnecessary order requests", async () => {
  const dependencies = { getOrders: async () => { assert.fail("Unexpected order request"); } };
  for (const [question, destination] of [
    ["Cancel my order", "/contact"],
    ["Change my order address", "/account?tab=addresses"],
    ["Browse products", "/products"],
    ["Payment help", "/cart"],
    ["Contact support", "/contact"],
    ["Something unrelated", "/contact"],
  ]) {
    const reply = await getSupportReply(question, dependencies);
    assert.ok(reply.actions.some(item => item.to === destination), question);
  }
  assert.match((await getSupportReply("refund", dependencies)).text, /can't make changes or approve/);
  assert.match((await getSupportReply("contact support", dependencies)).text, /aren't sent to a support agent/);
});
