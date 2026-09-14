import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    ctaText: { type: String, trim: true, default: "Shop now" },
    buttonColor: { type: String, default: "#1c1917" },
    buttonTextColor: { type: String, default: "#ffffff" },
    ctaLink: { type: String, trim: true, default: "/products" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Promo || mongoose.model("Promo", promoSchema);
