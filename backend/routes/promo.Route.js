import express from "express";
import mongoose from "mongoose";
import Promo from "../model/Promo.js";
import { validatePromo } from "../configs/validatePromo.js";

const router = express.Router();
const fail = (res, error) => res.status(error?.code === 11000 ? 409 : 500).json({ success: false, message: "Unable to save this popup." });

router.get("/", async (req, res) => {
  try { res.json({ success: true, promos: await Promo.find().sort({ createdAt: 1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load popups." }); }
});
router.post("/", async (req, res) => {
  let data;
  try { data = validatePromo(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try { res.status(201).json({ success: true, promo: await Promo.create(data) }); }
  catch (error) { fail(res, error); }
});
router.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ success: false, message: "Invalid popup ID." });
  next();
});
router.put("/:id", async (req, res) => {
  let data;
  try { data = validatePromo(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!promo) return res.status(404).json({ success: false, message: "Popup not found." });
    res.json({ success: true, promo });
  } catch (error) { fail(res, error); }
});
router.delete("/:id", async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: "Popup not found." });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Unable to delete this popup." }); }
});

export default router;
