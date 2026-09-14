import "dotenv/config";
import mongoose from "mongoose";
import User from "../model/User.modal.js";
import { seedAdminAccount } from "./seedAdminAccount.js";

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Project Admin";
  if (!process.env.MONGO_URI || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error("Set MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD (at least 12 characters) in backend/.env.");
  }
  await mongoose.connect(process.env.MONGO_URI, { dbName: "ayurvedic", serverSelectionTimeoutMS: 10000 });
  await User.init();
  const created = await seedAdminAccount({ name, email, password });
  if (!created) {
    console.log("Admin already exists. Password and account left unchanged.");
  } else {
    console.log("Admin created. Sign in at /admin with the credentials from backend/.env.");
  }
} catch (error) {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
