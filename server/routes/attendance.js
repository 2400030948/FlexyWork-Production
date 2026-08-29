import express from "express";
import { requireAuth, requireRole, requireVerifiedWorker } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { Notification } from "../models/Notification.js";
import { Payment } from "../models/Payment.js";
import { Shift } from "../models/Shift.js";

import { Application } from "../models/Application.js";
import { WorkerProfile } from "../models/Profile.js";

const router = express.Router();

router.post("/:shiftId/check-in", requireAuth, requireRole("worker"), requireVerifiedWorker, async (req, res, next) => {
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
      return res.status(400).json({ message: `Incorrect Arrival OTP code. Please ask the employer for the 4-digit verification code.` });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { shiftId: shift._id, workerId: req.user._id },
      { checkInAt: new Date(), status: "checked_in" },
      { returnDocument: "after", upsert: true }
    );
    shift.status = "in_progress";
    await shift.save();
    await Notification.create({ userId: shift.employerId, message: `${req.user.name} verified arrival via OTP and started ${shift.title}` });
    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});

router.post("/:shiftId/check-out", requireAuth, requireRole("worker"), requireVerifiedWorker, async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({ shiftId: req.params.shiftId, workerId: req.user._id });
    if (!attendance?.checkInAt) return res.status(409).json({ message: "Check in first" });
    attendance.checkOutAt = new Date();
    attendance.status = "completed";
    attendance.durationMinutes = Math.max(1, Math.round((attendance.checkOutAt - attendance.checkInAt) / 60000));
    await attendance.save();
    const shift = await Shift.findByIdAndUpdate(req.params.shiftId, { status: "completed" }, { returnDocument: "after" });
    if (shift) {
      await Payment.findOneAndUpdate(
        { shiftId: shift._id, workerId: req.user._id },
        {
          employerId: shift.employerId,
          amount: shift.paymentAmount,
          status: "pending"
        },
        { upsert: true, returnDocument: "after" }
      );
      await WorkerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { completedShifts: 1 } }
      );
      await Notification.create({ userId: shift.employerId, message: `${req.user.name} completed ${shift.title}` });
    }
    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});

export default router;
