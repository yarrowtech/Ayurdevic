import test from "node:test";
import assert from "node:assert/strict";
import { getProductPrice, getIncludedTax } from "./productPrice.js";
import { getProductPrice as frontendPrice } from "../../frontend/src/services/productPrice.js";
import { validateProduct } from "./validateProduct.js";
import { validateOrderRequest } from "./validateOrder.js";

test("bulk pricing starts at the configured quantity and stacks after existing discounts", () => {
  const product = { offerPrice: 100, extraDiscountPercent: 10, bulkMinQuantity: 4, bulkDiscountPercent: 5 };
  for (const price of [getProductPrice, frontendPrice]) {
    assert.equal(price(product), 90);
    assert.equal(price(product, 3), 90);
    for (const quantity of [4, 5, 6]) assert.equal(price(product, quantity), 85.5);
    assert.equal(price(product, 2), 90);
    assert.equal(price({ ...product, bulkDiscountPercent: 0 }, 6), 90);
    assert.equal(price({ offerPrice: 100 }, 6), 100);
    assert.equal(price({ ...product, bulkDiscountPercent: 100 }, 4), 0);
    assert.equal(price({ offerPrice: 19.99, bulkMinQuantity: 4, bulkDiscountPercent: 7 }, 4), 18.59);
    const unit = price({ offerPrice: 118, bulkMinQuantity: 4, bulkDiscountPercent: 10 }, 4);
    assert.equal(unit, 106.2);
    assert.equal(getIncludedTax(unit, 4, 18), 64.8);
  }
});

test("admin bulk settings validate thresholds and percentages", () => {
  const product = { name: "Product", category: "Care", price: 100, offerPrice: 100, image: ["https://example.com/product.png"], description: [], inStock: true };
  assert.equal(validateProduct(product).bulkDiscountPercent, 0);
  assert.equal(validateProduct({ ...product, bulkMinQuantity: 6, bulkDiscountPercent: 12.5 }).bulkDiscountPercent, 12.5);
  for (const bulkMinQuantity of [1, 4.5, 100, "4"]) assert.throws(() => validateProduct({ ...product, bulkMinQuantity }), /Bulk/);
  for (const bulkDiscountPercent of [-1, 101, NaN, "5"]) assert.throws(() => validateProduct({ ...product, bulkDiscountPercent }), /Bulk/);
});

test("repeated order lines combine per product before bulk pricing", () => {
  const productId = "0123456789abcdef01234567";
  const addressId = "1123456789abcdef01234567";
  const request = validateOrderRequest({ addressId, items: [{ productId, quantity: 2 }, { productId, quantity: 3 }] });
  assert.deepEqual(request.items, [{ productId, quantity: 5 }]);
  assert.throws(() => validateOrderRequest({ addressId, items: [{ productId, quantity: 60 }, { productId, quantity: 40 }] }), /99/);
});
