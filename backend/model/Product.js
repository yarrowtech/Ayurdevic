import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  offerPrice: { type: Number, required: true, min: 0 },
  image: { type: [String], required: true },
  description: { type: [String], default: [] },
  inStock: { type: Boolean, default: true },
  showInBanner: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
