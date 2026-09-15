export function getProductPrice(product, quantity = 1) {
  const discount = product?.extraDiscountPercent ?? 0;
  const price = Math.round(product.offerPrice * (100 - discount)) / 100;
  const bulkDiscount = quantity >= (product.bulkMinQuantity ?? 4) ? (product.bulkDiscountPercent ?? 0) : 0;
  return Math.round(price * (100 - bulkDiscount)) / 100;
}

export function getIncludedTax(price, quantity, taxRate = 0) {
  return Math.round(price * quantity * taxRate / (100 + taxRate) * 100) / 100;
}
