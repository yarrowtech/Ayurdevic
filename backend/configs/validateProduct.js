export function validateProduct(body) {
  const extraDiscountPercent = body.extraDiscountPercent ?? 0;
  if (!Number.isFinite(extraDiscountPercent) || extraDiscountPercent < 0 || extraDiscountPercent > 100) {
    throw new Error("Extra discount must be a number between 0 and 100 percent.");
  }
  const { name, category, price, offerPrice, image, description, inStock, showInBanner = false, isBestSeller = false } = body;
  if (typeof name !== "string" || !name.trim() || name.length > 150 ||
      typeof category !== "string" || !/^[a-zA-Z][a-zA-Z ]{0,59}$/.test(category) ||
      !Number.isFinite(price) || !Number.isFinite(offerPrice) ||
      price < 0 || offerPrice < 0 || offerPrice > price ||
      typeof inStock !== "boolean" ||
      typeof showInBanner !== "boolean" ||
      typeof isBestSeller !== "boolean" ||
      !Array.isArray(image) || !image.length || image.length > 8 ||
      !image.every(url => {
        try { return typeof url === "string" && ["https:", "http:"].includes(new URL(url).protocol); }
        catch { return false; }
      }) ||
      !Array.isArray(description) || description.length > 30 ||
      !description.every(line => typeof line === "string" && line.length <= 2000)) {
    throw new Error("Enter a name, category, valid image URLs, and prices with sale price no higher than regular price.");
  }
  return { name: name.trim(), category: category.trim(), price, offerPrice, extraDiscountPercent, image, description, inStock, showInBanner, isBestSeller };
}
