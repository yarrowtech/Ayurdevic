import test from "node:test";
import assert from "node:assert/strict";
import { validatePromo } from "./validatePromo.js";

test("button colors accept hex colors and remain unchanged when omitted", () => {
  const result = validatePromo({ title: "Sale", buttonColor: "#ff0000", buttonTextColor: "#ffffff" });
  assert.equal(result.buttonColor, "#ff0000");
  assert.equal(result.buttonTextColor, "#ffffff");
  assert.equal(Object.hasOwn(validatePromo({ title: "Sale" }), "buttonColor"), false);
  for (const buttonColor of [null, "red", "#123", "url(example)"]) {
    assert.throws(() => validatePromo({ title: "Sale", buttonColor }), /button color/);
  }
});

test("image popups can be saved and toggled without a title", () => {
  for (const title of [undefined, "", "   "]) {
    const result = validatePromo({ title, image: "https://shop.example/sale.png", active: false });
    assert.equal(result.title, "");
    assert.equal(result.active, false);
  }
  assert.throws(() => validatePromo({ title: "", image: "" }), /image or enter a title/);
});

test("promotion images accept uploaded URLs and explicit removal", () => {
  const image = "https://shop.example/uploads/sale.png";
  assert.equal(validatePromo({ title: "Sale", image }).image, image);
  assert.equal(validatePromo({ title: "Sale", image: "" }).image, "");
});

test("updates without an image preserve the existing image", () => {
  assert.equal(Object.hasOwn(validatePromo({ title: "Sale", active: false }), "image"), false);
});

test("promotion images reject invalid types and unsafe URLs", () => {
  for (const image of [null, 123, {}, "javascript:alert(1)", "data:image/png;base64,abc", "/uploads/image.png", "https://example.com/" + "x".repeat(2048)]) {
    assert.throws(() => validatePromo({ title: "Sale", image }), /image/i);
  }
});
