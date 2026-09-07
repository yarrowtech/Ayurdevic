import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Set it in backend/.env.");
    }
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    await mongoose.connect(process.env.MONGO_URI, { dbName: "ayurvedic" });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
