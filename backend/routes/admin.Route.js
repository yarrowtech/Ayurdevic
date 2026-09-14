import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import authUser from "../middleware/authUser.js";
import authAdmin from "../middleware/authAdmin.js";
import authStaff from "../middleware/authStaff.js";
import User from "../model/User.modal.js";
import Product from "../model/Product.js";
import { validateProduct } from "../configs/validateProduct.js";
import { validateStaffAccount, validateStaffPassword } from "../configs/validateStaff.js";
import { imageUpload } from "../configs/imageUpload.js";
import categoryRouter from "./category.Route.js";
import promoRouter from "./promo.Route.js";

const router = express.Router();
// Any signed-in admin or product admin may reach this router; individual
// routes narrow further with authAdmin where full admin access is required.
router.use(authUser, authStaff);
// Cookie-authenticated admin writes must originate from the storefront.
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("origin") !== (process.env.FRONTEND_URL || "http://localhost:5173")) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }
  next();
});
router.post("/images", ...imageUpload);
router.use("/categories", categoryRouter);
router.use("/promos", promoRouter);
router.get("/overview", async (req, res) => {
  try {
    const [users, products, inStock] = await Promise.all([
      User.countDocuments(), Product.countDocuments(), Product.countDocuments({ inStock: true }),
    ]);
    res.json({ success: true, stats: { users, products, inStock } });
  } catch { res.status(500).json({ success: false, message: "Unable to load dashboard" }); }
});

// Full admin only: account management.
router.get("/users", authAdmin, async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users });
  } catch { res.status(500).json({ success: false, message: "Unable to load users" }); }
});
router.post("/staff", authAdmin, async (req, res) => {
  let data;
  try { data = validateStaffAccount(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const existing = await User.findOne({ email: data.email }).collation({ locale: "en", strength: 2 });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const staff = await User.create({ name: data.name, email: data.email, password: hashedPassword, role: "product_admin" });
    res.status(201).json({ success: true, staff: { _id: staff._id, name: staff.name, email: staff.email, role: staff.role, createdAt: staff.createdAt } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    res.status(500).json({ success: false, message: "Unable to create the account." });
  }
});
router.param("staffId", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ success: false, message: "Invalid account ID" });
  next();
});
router.put("/staff/:staffId/password", authAdmin, async (req, res) => {
  let data;
  try { data = validateStaffPassword(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const staff = await User.findOneAndUpdate({ _id: req.params.staffId, role: "product_admin" }, { password: hashedPassword });
    if (!staff) return res.status(404).json({ success: false, message: "Product admin account not found." });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Unable to reset the password." }); }
});
router.delete("/staff/:staffId", authAdmin, async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ _id: req.params.staffId, role: "product_admin" });
    if (!staff) return res.status(404).json({ success: false, message: "Product admin account not found." });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Unable to remove this account." }); }
});

// Admin or product admin: catalog management.
router.get("/products", async (req, res) => {
  try { res.json({ success: true, products: await Product.find().sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load products" }); }
});
router.post("/products", async (req, res) => {
  let data;
  try { data = validateProduct(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try { res.status(201).json({ success: true, product: await Product.create(data) }); }
  catch { res.status(500).json({ success: false, message: "Unable to save product" }); }
});
router.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
  next();
});
router.put("/products/:id", async (req, res) => {
  let data;
  try { data = validateProduct(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch { res.status(500).json({ success: false, message: "Unable to save product" }); }
});
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Unable to delete product" }); }
});
export default router;
