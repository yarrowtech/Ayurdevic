export function validateStaffAccount(body = {}) {
  const { name, email, password } = body;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    throw new Error("Enter a name between 2 and 100 characters.");
  }
  if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    throw new Error("Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Use at least 8 characters and no more than 72 bytes for the password.");
  }
  return { name: name.trim(), email: email.trim().toLowerCase(), password };
}

export function validateStaffPassword(body = {}) {
  const { password } = body;
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Use at least 8 characters and no more than 72 bytes for the password.");
  }
  return { password };
}
