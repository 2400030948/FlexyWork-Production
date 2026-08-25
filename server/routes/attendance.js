import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { Shift } from "../models/Shift.js";

const router = express.Router();

router.post("/:shiftId/check-in", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift || !shift.assignedWorkerIds.some((id) => id.equals(req.user._id))) {
      return res.status(403).json({ message: "You are not assigned to this shift" });
    }
    const attendance = await Attendance.findOneAndUpdate(
      { shiftId: shift._id, workerId: req.user._id },
      { checkInAt: new Date(), status: "checked_in" },
      { returnDocument: "after", upsert: true }
    );
    shift.status = "in_progress";
    await shift.save();
    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});

router.post("/:shiftId/check-out", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({ shiftId: req.params.shiftId, workerId: req.user._id });
    if (!attendance?.checkInAt) return res.status(409).json({ message: "Check in first" });
    attendance.checkOutAt = new Date();
    attendance.status = "completed";
    attendance.durationMinutes = Math.max(1, Math.round((attendance.checkOutAt - attendance.checkInAt) / 60000));
    await attendance.save();
    await Shift.findByIdAndUpdate(req.params.shiftId, { status: "completed" });
    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});

export default router;
