import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/db.js";
import attendanceRoutes from "./routes/attendance.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import communityRoutes from "./routes/communities.js";
import notificationRoutes from "./routes/notifications.js";
import paymentRoutes from "./routes/payments.js";
import ratingRoutes from "./routes/ratings.js";
import shiftRoutes from "./routes/shifts.js";
import workerRoutes from "./routes/workers.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((error, _req, res, _next) => {
  if (error?.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", issues: error.issues });
  }
  const status = error.status || 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong" : error.message });
});

import bcrypt from "bcryptjs";
import { User } from "./models/User.js";

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const existing = await User.findOne({ email: adminEmail.toLowerCase().trim() });
  if (existing) return;

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.create({
    name: "FlexyWork Admin",
    email: adminEmail.toLowerCase().trim(),
    role: "admin",
    roles: ["admin"],
    passwordHash,
    location: "Indiranagar"
  });
  console.log(`Admin user created from .env: ${adminEmail}`);
}

connectDb()
  .then(async () => {
    await ensureAdminUser();
    app.listen(port, () => {
      console.log(`FlexyWork API listening on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error.message);
    process.exit(1);
  });
