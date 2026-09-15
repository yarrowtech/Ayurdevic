import mongoose from "mongoose";

export function validateOrderRequest(body = {}) {
  const { items, addressId, paymentMethod = "COD" } = body;
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error("Your cart is empty.");
  const cleanItems = items.map(item => {
    const productId = item?.productId;
    const quantity = Number(item?.quantity);
    if (!mongoose.isObjectIdOrHexString(productId)) throw new Error("Invalid product in cart.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid quantity in cart.");
    return { productId, quantity };
  });
  if (!mongoose.isObjectIdOrHexString(addressId)) throw new Error("Choose a delivery address.");
  if (!["COD", "Online"].includes(paymentMethod)) throw new Error("Choose a valid payment method.");
  const combined = new Map();
  for (const item of cleanItems) {
    const id = item.productId.toLowerCase();
    const quantity = (combined.get(id)?.quantity ?? 0) + item.quantity;
    if (quantity > 99) throw new Error("Maximum quantity per product is 99.");
    combined.set(id, { productId: id, quantity });
  }
  return { items: [...combined.values()], addressId, paymentMethod };
}
