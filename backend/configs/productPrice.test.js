import { test } from "node:test";
import assert from "node:assert/strict";
import { getProductPrice } from "./productPrice.js";
import { getProductPrice as frontendPrice } from "../../frontend/src/services/productPrice.js";
import { validateProduct } from "./validateProduct.js";

test("frontend and checkout agree on extra discounts and rounding", () => {
  for (const calculate of [getProductPrice, frontendPrice]) {
    assert.equal(calculate({ offerPrice: 90 }), 90);
    assert.equal(calculate({ offerPrice: 90, extraDiscountPercent: 10 }), 81);
    assert.equal(calculate({ offerPrice: 99.99, extraDiscountPercent: 12.5 }), 87.49);
    assert.equal(calculate({ offerPrice: 90, extraDiscountPercent: 100 }), 0);
    assert.equal(calculate({ offerPrice: 0, extraDiscountPercent: 10 }), 0);
  }
});

test("extra discount validation defaults to zero and rejects invalid values", () => {
  const product = { name: "Candle", category: "Candles", price: 100, offerPrice: 90, image: ["https://example.com/candle.png"], description: [], inStock: true };
  assert.equal(validateProduct(product).extraDiscountPercent, 0);
  assert.equal(validateProduct({ ...product, extraDiscountPercent: 12.5 }).extraDiscountPercent, 12.5);
  for (const extraDiscountPercent of [-1, 101, "10", NaN, Infinity, true]) {
    assert.throws(() => validateProduct({ ...product, extraDiscountPercent }), /Extra discount/);
  }
});
