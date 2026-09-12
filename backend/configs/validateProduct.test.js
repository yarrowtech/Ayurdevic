import { test } from "node:test";
import assert from "node:assert/strict";
import { validateProduct } from "./validateProduct.js";

test("homepage banner flag is optional for existing products and must be boolean", () => {
  const product = { name: "Candle", category: "Candles", price: 100, offerPrice: 90, image: ["https://example.com/candle.png"], description: [], inStock: true };
  assert.equal(validateProduct(product).showInBanner, false);
  assert.equal(validateProduct({ ...product, showInBanner: true }).showInBanner, true);
  assert.equal(validateProduct({ ...product, showInBanner: false }).showInBanner, false);
  assert.throws(() => validateProduct({ ...product, showInBanner: "false" }));
});

test("best seller selection defaults off and is independent of banner selection", () => {
  const product = { name: "Candle", category: "Candles", price: 100, offerPrice: 90, image: ["https://example.com/candle.png"], description: [], inStock: true };
  assert.equal(validateProduct(product).isBestSeller, false);
  const selected = validateProduct({ ...product, isBestSeller: true, showInBanner: false });
  assert.equal(selected.isBestSeller, true);
  assert.equal(selected.showInBanner, false);
  assert.equal(validateProduct({ ...product, isBestSeller: false }).isBestSeller, false);
  assert.throws(() => validateProduct({ ...product, isBestSeller: "true" }));
});
