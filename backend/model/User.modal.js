import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required() { return !this.googleId; } },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin", "product_admin"], default: "user" },
    cartItems: { type: Object, default: {} },
    addresses: { type: [addressSchema], default: [] },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
