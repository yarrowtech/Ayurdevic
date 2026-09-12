import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required() { return !this.googleId; } },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
