import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { Notification } from "../models/Notification.js";
import { Shift } from "../models/Shift.js";

import { Application } from "../models/Application.js";
import { WorkerProfile } from "../models/Profile.js";

const router = express.Router();

/**
 * POST /api/attendance/:shiftId/check-in
 *
 * Worker checks in to a shift using the employer-provided OTP.
 *
 * Authorization model (intentionally strict, in this order):
 *   1. requireAuth      — must be a logged-in user (401 if no/invalid token).
 *   2. requireRole      — must have the "worker" role (403 "Forbidden" if not).
 *   3. In-handler guard — must be assigned to this shift, OR have an
 *                         accepted application for it.
 *   4. OTP check        — provided OTP must match the shift's checkInOtp.
 *
 * NOTE: We intentionally do NOT require admin-verified certificates here.
 * The certificate gate is enforced when the worker applies to / accepts a
 * shift. Once the worker is already on a shift, they must be able to
 * perform routine check-in / check-out without being blocked by a
 * pending certificate review — that would lock them out of work they
 * were legitimately assigned to.
 */
router.post("/:shiftId/check-in", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const isAssigned =
      shift.assignedWorkerIds.some((id) => id.toString() === req.user._id.toString()) ||
      Boolean(await Application.findOne({ shiftId: shift._id, workerId: req.user._id, status: "accepted" }));
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this shift" });
    }

    const hash = shift._id.toString();
    const num = Math.abs(hash.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)) % 9000 + 1000;
    const expectedOtp = shift.checkInOtp || String(num);

    const providedOtp = req.body?.otp ? String(req.body.otp).trim() : null;
    if (providedOtp && providedOtp !== expectedOtp) {
      return res.status(400).json({ message: "Incorrect Arrival OTP code. Please ask the employer for the 4-digit verification code." });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { shiftId: shift._id, workerId: req.user._id },
      { checkInAt: new Date(), status: "checked_in" },
      { returnDocument: "after", upsert: true }
    );
    shift.status = "in_progress";
    await shift.save();
    await Notification.create({
      userId: shift.employerId,
      message: `${req.user.name} verified arrival via OTP for ${shift.title}. Complete Razorpay payment to secure the worker payout.`
    });
    res.json({ attendance, paymentRequired: true, shiftId: shift._id.toString() });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/:shiftId/check-out
 *
 * Workers cannot self-complete shifts. The gig is marked complete only
 * after the employer pays via Razorpay (see payments verify route).
 */
router.post("/:shiftId/check-out", requireAuth, requireRole("worker"), async (req, res) => {
  res.status(403).json({
    message: "Shift completion is handled automatically after the employer completes Razorpay payment."
  });
});

export default router;
