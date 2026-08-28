import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Application } from "../models/Application.js";
import { EmployerProfile, WorkerProfile } from "../models/Profile.js";
import { Rating } from "../models/Rating.js";
import { Shift } from "../models/Shift.js";

const router = express.Router();

const ratingSchema = z.object({
  toUserId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().max(500).optional()
});

async function refreshAverage(toUserId) {
  const ratings = await Rating.find({ toUserId });
  const average = ratings.reduce((total, item) => total + item.rating, 0) / Math.max(ratings.length, 1);
  await Promise.all([
    WorkerProfile.findOneAndUpdate({ userId: toUserId }, { rating: Number(average.toFixed(1)) }),
    EmployerProfile.findOneAndUpdate({ userId: toUserId }, { rating: Number(average.toFixed(1)) })
  ]);
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const ratings = await Rating.find({ $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }] })
      .populate("shiftId")
      .populate("fromUserId")
      .populate("toUserId")
      .sort({ createdAt: -1 });
    res.json({ ratings });
  } catch (error) {
    next(error);
  }
});

router.post("/:shiftId", requireAuth, async (req, res, next) => {
  try {
    const body = ratingSchema.parse(req.body);
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (shift.status !== "completed") return res.status(409).json({ message: "Complete the shift before rating" });

    const isWorker = req.user.role === "worker";
    const isEmployer = req.user.role === "employer" && shift.employerId.equals(req.user._id);

    const isAssignedWorker = isWorker && (
      shift.assignedWorkerIds.some((id) => id.equals(req.user._id)) ||
      Boolean(await Application.findOne({ shiftId: shift._id, workerId: req.user._id, status: "accepted" }))
    );

    if (!isEmployer && !isAssignedWorker && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isWorker && !shift.employerId.equals(body.toUserId)) {
      return res.status(403).json({ message: "Workers can only rate the employer for this shift" });
    }
    if (isEmployer && !shift.assignedWorkerIds.some((id) => id.toString() === body.toUserId.toString())) {
      const app = await Application.findOne({ shiftId: shift._id, workerId: body.toUserId, status: "accepted" });
      if (!app) {
        return res.status(403).json({ message: "Employers can only rate accepted workers" });
      }
    }

    const rating = await Rating.create({
      shiftId: shift._id,
      fromUserId: req.user._id,
      toUserId: body.toUserId,
      rating: body.rating,
      review: body.review || ""
    });
    await refreshAverage(body.toUserId);
    res.status(201).json({ rating });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You already rated this user for this shift" });
    next(error);
  }
});

export default router;
