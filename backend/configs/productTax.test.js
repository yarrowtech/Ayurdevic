import test from "node:test";
import assert from "node:assert/strict";
import { getIncludedTax, getProductPrice } from "./productPrice.js";
import { getIncludedTax as frontendTax } from "../../frontend/src/services/productPrice.js";
import { validateProduct } from "./validateProduct.js";

test("included tax is extracted from discounted prices with quantity and mixed rates", () => {
  for (const calculate of [getIncludedTax, frontendTax]) {
    assert.equal(calculate(118, 1, 18), 18);
    assert.equal(calculate(105, 2, 5), 10);
    assert.equal(calculate(1500, 1, 18), 228.81);
    assert.equal(calculate(1500, 1), 0);
    assert.equal(calculate(0, 2, 18), 0);
    assert.equal(calculate(getProductPrice({ offerPrice: 118, extraDiscountPercent: 10 }), 2, 18), 32.4);
    const tax = calculate(118, 1, 18) + calculate(105, 2, 5);
    assert.equal(tax, 28);
    assert.equal((118 + 210 - tax) + tax, 328);
  }
});

test("product tax rates are validated and default to zero", () => {
  const product = { name: "Product", category: "Care", price: 118, offerPrice: 118, image: ["https://example.com/image.png"], description: [], inStock: true };
  assert.equal(validateProduct(product).taxRate, 0);
  assert.equal(validateProduct({ ...product, taxRate: 18 }).taxRate, 18);
  for (const taxRate of [-1, 101, "18", NaN, Infinity]) {
    assert.throws(() => validateProduct({ ...product, taxRate }), /Tax/);
  }
});
