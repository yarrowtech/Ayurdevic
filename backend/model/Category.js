import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  offer: { type: String, default: "" },
  visible: { type: Boolean, default: true },
}, { timestamps: true });
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
