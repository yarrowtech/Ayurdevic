export function validateAddress(body = {}) {
  const { label = "Home", line1, line2 = "", city, state, postalCode, country = "India", phone, isDefault = false } = body;
  const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;

  const cleanLabel = (typeof label === "string" ? label.trim() : "").slice(0, 40) || "Home";
  const cleanLine1 = text(line1, 200);
  if (!cleanLine1) throw new Error("Enter the address line.");
  const cleanLine2 = typeof line2 === "string" ? line2.trim().slice(0, 200) : "";
  const cleanCity = text(city, 100);
  if (!cleanCity) throw new Error("Enter a city.");
  const cleanState = text(state, 100);
  if (!cleanState) throw new Error("Enter a state.");
  const cleanPostalCode = typeof postalCode === "string" && /^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/.test(postalCode.trim()) ? postalCode.trim() : null;
  if (!cleanPostalCode) throw new Error("Enter a valid postal code.");
  const cleanCountry = text(country, 60) || "India";
  const cleanPhone = typeof phone === "string" && /^[0-9]{10}$/.test(phone.trim()) ? phone.trim() : null;
  if (!cleanPhone) throw new Error("Enter exactly 10 digits for the phone number.");
  if (typeof isDefault !== "boolean") throw new Error("Invalid default flag.");

  return { label: cleanLabel, line1: cleanLine1, line2: cleanLine2, city: cleanCity, state: cleanState, postalCode: cleanPostalCode, country: cleanCountry, phone: cleanPhone, isDefault };
}
