import { test } from "node:test";
import assert from "node:assert/strict";
import { getCurrentAddress } from "../src/services/locationService.js";

test("current address handles permission, lookup, and cancellation", async t => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const originalFetch = globalThis.fetch;
  const browser = { geolocation: { getCurrentPosition: resolve => resolve({ coords: { latitude: 19, longitude: 73 } }) } };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: true } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: browser });
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else delete globalThis.window;
    if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator); else delete globalThis.navigator;
    globalThis.fetch = originalFetch;
  });
  let calls = 0;
  globalThis.fetch = async url => {
    calls++;
    assert.equal(url.searchParams.get("lat"), "19");
    assert.equal(url.searchParams.get("lon"), "73");
    return { ok: true, json: async () => ({ features: [{ properties: { housenumber: "12", street: "Market Road", city: "Mumbai", state: "Maharashtra", postcode: "400001", country: "India" } }] }) };
  };
  const request = () => getCurrentAddress(new AbortController().signal);
  assert.deepEqual(await request(), { line1: "12 Market Road", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "India" });

  const locate = browser.geolocation.getCurrentPosition;
  for (const [code, message] of [[1, /permission was denied/], [2, /unavailable/], [3, /timed out/]]) {
    browser.geolocation.getCurrentPosition = (_, reject) => reject({ code });
    await assert.rejects(request, message);
  }
  assert.equal(calls, 1, "denied or unavailable locations never reach the provider");
  browser.geolocation.getCurrentPosition = locate;

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => getCurrentAddress(controller.signal), { name: "AbortError" });
  assert.equal(calls, 1, "canceled requests never reach the provider");

  globalThis.fetch = async () => ({ ok: true, json: async () => ({ features: [] }) });
  await assert.rejects(request, /No address was found/);
  globalThis.fetch = async () => ({ ok: false });
  await assert.rejects(request, /lookup is unavailable/);
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(request, /Check your connection/);
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ features: [{ properties: { city: "Pune", country: "India" } }] }) });
  assert.deepEqual(await request(), { line1: "", city: "Pune", state: "", postalCode: "", country: "India" });

  window.isSecureContext = false;
  await assert.rejects(request, /HTTPS or localhost/);
  window.isSecureContext = true;
  delete browser.geolocation;
  await assert.rejects(request, /does not support/);
});
