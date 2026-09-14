import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import userRouter from "./routes/user.Route.js";
import adminRouter from "./routes/admin.Route.js";
import Product from "./model/Product.js";
import Category from "./model/Category.js";
import Promo from "./model/Promo.js";
import { uploadDirectory } from "./configs/imageUpload.js";

const app = express();
const port = process.env.PORT || 5000;

await connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static(uploadDirectory, {
  dotfiles: "deny",
  setHeaders: res => res.setHeader("X-Content-Type-Options", "nosniff"),
}));
app.get("/api/products", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try { res.json({ success: true, products: await Product.find().sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load products" }); }
});
app.get("/api/categories", async (req, res) => {
  try { res.json({ success: true, categories: await Category.find({ visible: true }).sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load categories." }); }
});
app.get("/api/promos", async (req, res) => {
  try { res.json({ success: true, promos: await Promo.find({ active: true }).sort({ createdAt: 1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load popups." }); }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
