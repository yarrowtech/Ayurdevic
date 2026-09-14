import express from "express";
import mongoose from "mongoose";
import User from "../model/User.modal.js";
import authUser from "../middleware/authUser.js";
import { validateAddress } from "../configs/validateAddress.js";

const router = express.Router();
router.use(authUser);

const fail = res => res.status(500).json({ success: false, message: "Unable to save your address. Please try again." });

// GET /api/user/addresses
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    res.json({ success: true, addresses: user.addresses });
  } catch { res.status(500).json({ success: false, message: "Unable to load your addresses." }); }
});

// POST /api/user/addresses
router.post("/", async (req, res) => {
  let data;
  try { data = validateAddress(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    if (!user.addresses.length) data.isDefault = true; // first address is always the default
    else if (data.isDefault) user.addresses.forEach(address => { address.isDefault = false; });
    user.addresses.push(data);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch { fail(res); }
});

router.param("addressId", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ success: false, message: "Invalid address ID." });
  next();
});

// PUT /api/user/addresses/:addressId
router.put("/:addressId", async (req, res) => {
  let data;
  try { data = validateAddress(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: "Address not found." });
    if (data.isDefault) user.addresses.forEach(item => { item.isDefault = false; });
    Object.assign(address, data);
    if (!user.addresses.some(item => item.isDefault)) address.isDefault = true; // never leave zero defaults
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch { fail(res); }
});

// DELETE /api/user/addresses/:addressId
router.delete("/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: "Address not found." });
    const wasDefault = address.isDefault;
    user.addresses.pull({ _id: req.params.addressId });
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch { res.status(500).json({ success: false, message: "Unable to delete this address." }); }
});

export default router;
