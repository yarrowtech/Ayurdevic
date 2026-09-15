import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["page_view", "product_view", "login"], required: true },
    path: { type: String, trim: true, default: "" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, trim: true, default: "" },
    visitorId: { type: String, trim: true, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);
visitSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.Visit || mongoose.model("Visit", visitSchema);
