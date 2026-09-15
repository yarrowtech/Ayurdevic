import express from "express";
import Visit from "../model/Visit.js";
import Product from "../model/Product.js";
import User from "../model/User.modal.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { validateVisit } from "../configs/validateVisit.js";

const router = express.Router();
router.use(optionalAuth);

// POST /api/track — records a page view or product view. Public (works for
// signed-out shoppers too); attributes the event to the signed-in user when
// there is one, so admin analytics can tell logged-in visits from guest ones.
router.post("/", async (req, res) => {
  let data;
  try { data = validateVisit(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const doc = { type: data.type, path: data.path, visitorId: data.visitorId };
    if (data.productId) {
      const product = await Product.findById(data.productId).select("name");
      if (product) { doc.product = product._id; doc.productName = product.name; }
    }
    if (req.userId) {
      const user = await User.findById(req.userId).select("name");
      if (user) { doc.user = user._id; doc.userName = user.name; }
    }
    await Visit.create(doc);
    res.status(201).json({ success: true });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to record event." }); }
});

export default router;
