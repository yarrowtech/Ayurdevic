import express from "express";
import User from "../model/User.modal.js";
import Product from "../model/Product.js";
import Order from "../model/Order.js";
import authUser from "../middleware/authUser.js";
import { validateOrderRequest } from "../configs/validateOrder.js";
import { getProductPrice, getIncludedTax } from "../configs/productPrice.js";

const router = express.Router();
router.use(authUser);

// GET /api/user/orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch { res.status(500).json({ success: false, message: "Unable to load your orders." }); }
});

// POST /api/user/orders
router.post("/", async (req, res) => {
  let data;
  try { data = validateOrderRequest(req.body); }
  catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });
    const address = user.addresses.id(data.addressId);
    if (!address) return res.status(400).json({ success: false, message: "Choose a valid delivery address." });

    const items = [];
    for (const { productId, quantity } of data.items) {
      const product = await Product.findById(productId);
      if (!product || !product.inStock) return res.status(409).json({ success: false, message: `${product?.name || "An item"} in your cart is no longer available.` });
      const price = getProductPrice(product, quantity);
      const taxRate = product.taxRate ?? 0;
      items.push({ product: product._id, name: product.name, image: product.image?.[0] || "", price, quantity, taxRate, tax: getIncludedTax(price, quantity, taxRate), bulkDiscountPercent: quantity >= (product.bulkMinQuantity ?? 4) ? (product.bulkDiscountPercent ?? 0) : 0 });
    }

    const gross = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const tax = Math.round(items.reduce((sum, item) => sum + item.tax, 0) * 100) / 100;
    const subtotal = Math.round((gross - tax) * 100) / 100;
    const shippingFee = 0;
    const total = Math.round((subtotal + tax + shippingFee) * 100) / 100;

    const order = await Order.create({
      user: user._id,
      items,
      address: { label: address.label, line1: address.line1, line2: address.line2, city: address.city, state: address.state, postalCode: address.postalCode, country: address.country, phone: address.phone },
      paymentMethod: data.paymentMethod,
      subtotal, tax, taxIncluded: true, shippingFee, total,
    });
    res.status(201).json({ success: true, order });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to place your order. Please try again." }); }
});

export default router;
