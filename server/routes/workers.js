import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { WorkerProfile } from "../models/Profile.js";

const router = express.Router();

router.get("/me/availability", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    res.json({ availability: profile?.availability || [] });
  } catch (error) {
    next(error);
  }
});

router.put("/me/availability", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const body = z.object({
      availability: z.array(
        z.object({
          day: z.string(),
          status: z.enum(["Available", "Unavailable", "Limited"]),
          ranges: z.array(z.string())
        })
      )
    }).parse(req.body);
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { availability: body.availability },
      { new: true }
    );
    res.json({ availability: profile.availability });
  } catch (error) {
    next(error);
  }
});

export default router;
