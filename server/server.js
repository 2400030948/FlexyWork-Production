import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/db.js";
import attendanceRoutes from "./routes/attendance.js";
import authRoutes from "./routes/auth.js";
import shiftRoutes from "./routes/shifts.js";
import workerRoutes from "./routes/workers.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((error, _req, res, _next) => {
  if (error?.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", issues: error.issues });
  }
  const status = error.status || 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong" : error.message });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`FlexWork API listening on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error.message);
    process.exit(1);
  });
