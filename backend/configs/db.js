import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Set it in backend/.env.");
    }
    mongoose.connection.on("connected", () => {
      logger.info("Database connected");
    });
    await mongoose.connect(process.env.MONGO_URI, { dbName: "ayurvedic" });
  } catch (error) {
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }
};

export default connectDB;
