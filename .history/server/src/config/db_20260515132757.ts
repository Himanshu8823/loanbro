import mongoose from "mongoose";
import { env } from "./env";

// Mongoose connection 
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Mongoose disconnection
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
};