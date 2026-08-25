import dotenv from "dotenv";
import { connectDb } from "../server/config/db.js";

dotenv.config();

try {
  const connection = await connectDb();
  const result = await connection.db.admin().ping();
  console.log(`MongoDB connected: ${connection.name}`);
  console.log(result);
  await connection.close();
  process.exit(0);
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}
