import express from "express";
import mongoose from "mongoose";
import authUser from "../middleware/authUser.js";
import authAdmin from "../middleware/authAdmin.js";
import User from "../model/User.modal.js";
import Product from "../model/Product.js";
import { validateProduct } from "../configs/validateProduct.js";
import { imageUpload } from "../configs/imageUpload.js";
import categoryRouter from "./category.Route.js";

const router = express.Router();
router.use(authUser, authAdmin);
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
router.get("/overview", async (req, res) => {
  try {
    const [users, products, inStock] = await Promise.all([
      User.countDocuments(), Product.countDocuments(), Product.countDocuments({ inStock: true }),
    ]);
    res.json({ success: true, stats: { users, products, inStock } });
  } catch { res.status(500).json({ success: false, message: "Unable to load dashboard" }); }
});
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users });
  } catch { res.status(500).json({ success: false, message: "Unable to load users" }); }
});
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
