import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { Notification } from "../models/Notification.js";
import { Payment } from "../models/Payment.js";
import { Shift } from "../models/Shift.js";

const router = express.Router();

function serializePayment(payment) {
  const shift = payment.shiftId;
  return {
    id: payment._id.toString(),
    userId: payment.workerId.toString(),
    date: payment.paidAt ? payment.paidAt.toISOString().slice(0, 10) : payment.createdAt.toISOString().slice(0, 10),
    amount: payment.amount,
    type: "earnings",
    description: shift?.title ? `Earnings: ${shift.title}` : "Shift earnings",
    status: payment.status === "marked_paid" ? "completed" : "pending"
  };
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === "worker" ? { workerId: req.user._id } : { employerId: req.user._id };
    const payments = await Payment.find(query).populate("shiftId").sort({ createdAt: -1 });
    res.json({ payments: payments.map(serializePayment) });
  } catch (error) {
    next(error);
  }
});

router.post("/:shiftId/mark-paid", requireAuth, requireRole(["employer", "admin"]), async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (!shift.employerId.equals(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    if (shift.status !== "completed") return res.status(409).json({ message: "Complete the shift before marking payment paid" });

    let workerIds = [];
    const attendances = await Attendance.find({ shiftId: shift._id });
    if (attendances.length) {
      workerIds = attendances.map((a) => a.workerId);
    } else if (shift.assignedWorkerIds?.length) {
      workerIds = shift.assignedWorkerIds;
    }

    if (!workerIds.length) {
      return res.status(409).json({ message: "No assigned workers found for this shift" });
    }

    const payments = await Promise.all(
      workerIds.map(async (workerId) => {
        const payment = await Payment.findOneAndUpdate(
          { shiftId: shift._id, workerId },
          {
            employerId: shift.employerId,
            amount: shift.paymentAmount,
            status: "marked_paid",
            paidAt: new Date()
          },
          { upsert: true, returnDocument: "after" }
        ).populate("shiftId");

        await Notification.create({ userId: workerId, message: `Payment of ₹${shift.paymentAmount} marked paid for ${shift.title}` });
        return serializePayment(payment);
      })
    );

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

export default router;
