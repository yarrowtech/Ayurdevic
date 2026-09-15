import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    bulkDiscountPercent: { type: Number, min: 0, max: 100 },
    taxRate: { type: Number, min: 0, max: 100 },
    tax: { type: Number, min: 0 },
  },
  { _id: false }
);

const orderAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: value => Array.isArray(value) && value.length > 0 },
    address: { type: orderAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    taxIncluded: { type: Boolean, default: false },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"], default: "Placed" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
