export function validateCategory(body = {}) {
  const { name, image = "", offer = "", visible } = body;
  if (typeof name !== "string" || !/^[a-zA-Z][a-zA-Z ]{0,59}$/.test(name.trim())) {
    throw new Error("Enter a category name using letters and spaces (up to 60 characters).");
  }
  if (typeof image !== "string" || image.length > 2048) throw new Error("Enter a valid image URL.");
  if (image) {
    try { if (!["http:", "https:"].includes(new URL(image).protocol)) throw new Error(); }
    catch { throw new Error("Enter an HTTP or HTTPS image URL."); }
  }
  if (typeof offer !== "string" || offer.length > 120) throw new Error("Offer text must be 120 characters or fewer.");
  if (typeof visible !== "boolean") throw new Error("Choose category visibility.");
  return { name: name.trim(), image: image.trim(), offer: offer.trim(), visible };
}
