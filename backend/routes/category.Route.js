import express from "express";
import mongoose from "mongoose";
import Category from "../model/Category.js";
import { validateCategory } from "../configs/validateCategory.js";

const router = express.Router();
const fail = (res, error) => res.status(error.code === 11000 ? 409 : 500).json({ success: false, message: error.code === 11000 ? "A category with this name already exists." : "Unable to save category." });
router.get("/", async (req, res) => {
  try { res.json({ success: true, categories: await Category.find().sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load categories." }); }
});
router.post("/", async (req, res) => {
  let data;
  try { data = validateCategory(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try { res.status(201).json({ success: true, category: await Category.create({ ...data, key: data.name.toLowerCase() }) }); }
  catch (error) { fail(res, error); }
});
router.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ success: false, message: "Invalid category ID." });
  next();
});
router.put("/:id", async (req, res) => {
  let data;
  try { data = validateCategory(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, category });
  } catch (error) { fail(res, error); }
});
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Unable to delete category." }); }
});
export default router;
