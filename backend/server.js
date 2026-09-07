import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import userRouter from "./routes/user.Route.js";
import adminRouter from "./routes/admin.Route.js";
import Product from "./model/Product.js";

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
app.get("/api/products", async (req, res) => {
  try { res.json({ success: true, products: await Product.find().sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ success: false, message: "Unable to load products" }); }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
