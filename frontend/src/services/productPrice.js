export function getProductPrice(product) {
  const discount = product?.extraDiscountPercent ?? 0;
  return Math.round(product.offerPrice * (100 - discount)) / 100;
}
