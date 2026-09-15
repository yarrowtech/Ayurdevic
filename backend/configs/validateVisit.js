import mongoose from "mongoose";

export function validateVisit(body = {}) {
  const { type, path = "", productId } = body;
  if (!["page_view", "product_view"].includes(type)) throw new Error("Invalid event type.");
  if (typeof path !== "string" || path.length > 300) throw new Error("Invalid path.");

  const visitorId = typeof body.visitorId === "string" ? body.visitorId.trim() : "";
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(visitorId)) throw new Error("Invalid visitor id.");

  let cleanProductId;
  if (type === "product_view") {
    if (!mongoose.isObjectIdOrHexString(productId)) throw new Error("Invalid product id.");
    cleanProductId = productId;
  }

  return { type, path: path.trim().slice(0, 300), productId: cleanProductId, visitorId };
}
