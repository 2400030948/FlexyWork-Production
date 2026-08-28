import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { EmployerProfile, WorkerProfile } from "../models/Profile.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["worker", "employer", "seeker", "admin"]),
  location: z.string().min(2).optional(),
  businessName: z.string().optional()
});

function sign(user) {
  const role = user.role === "seeker" ? "employer" : user.role;
  return jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function createProfile(user, body) {
  if (user.role === "admin") return null;

  if (user.role === "worker") {
    return WorkerProfile.create({
      userId: user._id,
      location: body.location || user.location || "Indiranagar",
      skills: ["Customer handling", "Table service", "Billing support"],
      availability: [
        { day: "Mon", status: "Available", ranges: ["6 PM - 10 PM"] },
        { day: "Tue", status: "Available", ranges: ["6 PM - 10 PM"] },
        { day: "Wed", status: "Unavailable", ranges: [] },
        { day: "Thu", status: "Available", ranges: ["5 PM - 9 PM"] },
        { day: "Fri", status: "Available", ranges: ["6 PM - 11 PM"] },
        { day: "Sat", status: "Available", ranges: ["10 AM - 8 PM"] },
        { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
      ]
    });
  }

  return EmployerProfile.create({
    userId: user._id,
    businessName: body.businessName || `${user.name}'s Household`,
    location: body.location || user.location || "Indiranagar"
  });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const normalizedRole = body.role === "seeker" ? "employer" : body.role;
    const cleanEmail = body.email.trim().toLowerCase();
    const existing = await User.findOne({ email: new RegExp("^" + escapeRegex(cleanEmail) + "$", "i") });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ ...body, email: cleanEmail, role: normalizedRole, passwordHash });
    await createProfile(user, body);
    const token = sign(user);
    res.cookie("flexywork_token", token, cookieOptions).status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().min(3), password: z.string().min(1) }).parse(req.body);
    const cleanEmail = body.email.trim();
    const user = await User.findOne({ email: new RegExp("^" + escapeRegex(cleanEmail) + "$", "i") }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = sign(user);
    res.cookie("flexywork_token", token, cookieOptions).json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("flexywork_token").json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  let profile = null;
  if (req.user.role === "worker") {
    profile = await WorkerProfile.findOne({ userId: req.user._id });
  } else if (req.user.role !== "admin") {
    profile = await EmployerProfile.findOne({ userId: req.user._id });
  }
  res.json({ user: req.user, profile });
});

export default router;
