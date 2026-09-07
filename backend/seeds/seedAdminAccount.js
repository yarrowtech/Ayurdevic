import bcrypt from "bcryptjs";
import User from "../model/User.modal.js";

export async function seedAdminAccount({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing && existing.role !== "admin") {
    throw new Error("This email belongs to a customer. Choose a separate admin email; no account was changed.");
  }
  if (existing) return false;
  await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "admin" });
  return true;
}
