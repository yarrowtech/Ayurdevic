export function validatePromo(body = {}) {
  const { title = "", subtitle = "", ctaText = "Shop now", ctaLink = "/products", active = true } = body;
  if (typeof title !== "string" || title.trim().length > 80) {
    throw new Error("Enter a title up to 80 characters.");
  }
  if (typeof subtitle !== "string" || subtitle.length > 200) {
    throw new Error("Subtitle must be 200 characters or fewer.");
  }
  if (typeof ctaText !== "string" || !ctaText.trim() || ctaText.trim().length > 40) {
    throw new Error("Enter button text up to 40 characters.");
  }
  const link = typeof ctaLink === "string" ? ctaLink.trim() : "";
  const isInternal = link.startsWith("/");
  const isExternal = (() => { try { return ["http:", "https:"].includes(new URL(link).protocol); } catch { return false; } })();
  if (!link || link.length > 300 || !(isInternal || isExternal)) {
    throw new Error("Enter a link starting with / for an internal page, or a full https:// URL.");
  }
  if (typeof active !== "boolean") throw new Error("Choose whether this popup is active.");
  const result = { title: title.trim(), subtitle: subtitle.trim(), ctaText: ctaText.trim(), ctaLink: link, active };
  for (const field of ["buttonColor", "buttonTextColor"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string" || !/^#[0-9a-f]{6}$/i.test(body[field])) throw new Error("Choose a valid button color.");
      result[field] = body[field];
    }
  }
  if (body.image !== undefined) {
    if (typeof body.image !== "string" || body.image.length > 2048) throw new Error("Choose a valid popup image.");
    const image = body.image.trim();
    if (image) {
      try {
        if (!["http:", "https:"].includes(new URL(image).protocol)) throw new Error();
      } catch { throw new Error("Choose a valid popup image URL using HTTP or HTTPS."); }
    }
    result.image = image;
  }
  if (!result.title && !result.image) throw new Error("Add an image or enter a title.");
  return result;
}
