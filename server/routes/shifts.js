import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Application } from "../models/Application.js";
import { Attendance } from "../models/Attendance.js";
import { Notification } from "../models/Notification.js";
import { EmployerProfile, WorkerProfile } from "../models/Profile.js";
import { Shift } from "../models/Shift.js";
import { User } from "../models/User.js";
import { calculateMatch } from "../services/matching.js";

const router = express.Router();

const shiftSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(8),
  category: z.string().min(2),
  requiredSkills: z.array(z.string()).default([]),
  workersRequired: z.coerce.number().int().min(1).default(1),
  date: z.string().min(4),
  startTime: z.string().min(2),
  endTime: z.string().min(2),
  duration: z.string().min(1),
  paymentType: z.enum(["fixed", "hourly"]).default("fixed"),
  paymentAmount: z.coerce.number().min(1),
  location: z.string().min(2),
  maximumDistance: z.coerce.number().min(1).default(8),
  urgency: z.enum(["normal", "urgent"]).default("normal")
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function serializeShift(shift, workerProfile, viewerId) {
  const employer = await User.findById(shift.employerId);
  const employerProfile = await EmployerProfile.findOne({ userId: shift.employerId });
  const application = viewerId ? await Application.findOne({ shiftId: shift._id, workerId: viewerId }) : null;
  const match = workerProfile ? calculateMatch(shift, workerProfile) : null;

  // Retrieve attendance record for accurate check-in / check-out timestamps
  let attendance = null;
  if (viewerId) {
    attendance = await Attendance.findOne({ shiftId: shift._id, workerId: viewerId });
  }
  if (!attendance && shift.assignedWorkerIds?.length > 0) {
    attendance = await Attendance.findOne({ shiftId: shift._id, workerId: { $in: shift.assignedWorkerIds } });
  }

  const assignedWorkerIds = (shift.assignedWorkerIds || []).map((id) => id.toString());
  const viewerIsAssigned = viewerId ? assignedWorkerIds.includes(viewerId.toString()) : false;

  let uiStatus = "REQUESTED";
  if (shift.status === "completed") {
    uiStatus = "COMPLETED";
  } else if (shift.status === "in_progress") {
    uiStatus = "IN_PROGRESS";
  } else if (shift.status === "filled" || assignedWorkerIds.length > 0 || (viewerIsAssigned && shift.status === "published")) {
    uiStatus = "ACCEPTED";
  } else if (shift.status === "cancelled") {
    uiStatus = "DECLINED";
  } else {
    uiStatus = "REQUESTED";
  }

  const formatTime = (date) => {
    if (!date) return undefined;
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return {
    id: shift._id.toString(),
    title: shift.title,
    role: shift.title,
    description: shift.description,
    category: shift.category,
    requiredSkills: shift.requiredSkills,
    skills: shift.requiredSkills,
    workersRequired: shift.workersRequired,
    filledCount: shift.assignedWorkerIds.length,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    time: `${shift.startTime} - ${shift.endTime}`,
    duration: shift.duration,
    paymentType: shift.paymentType,
    paymentAmount: shift.paymentAmount,
    pay: shift.paymentAmount,
    location: shift.location,
    area: shift.location,
    distance: 1.4,
    maximumDistance: shift.maximumDistance,
    status: uiStatus,
    urgency: shift.urgency,
    employerId: shift.employerId.toString(),
    employerName: employerProfile?.businessName || employer?.name || "Local employer",
    assignedWorkerIds,
    employer: employerProfile?.businessName || employer?.name || "Local employer",
    employerInfo: employer ? { id: employer.id, name: employer.name, email: employer.email } : null,
    match,
    matchScore: match?.score,
    matchReasons: match?.reasons || [],
    applicationStatus: application?.status || (viewerIsAssigned ? "accepted" : null),
    checkInTime: formatTime(attendance?.checkInAt),
    checkOutTime: formatTime(attendance?.checkOutAt),
    tags: [shift.urgency === "urgent" ? "Urgent" : "Nearby", shift.category, shift.paymentType === "fixed" ? "Fixed pay" : "Hourly"]
  };
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = { status: "published" };
    if (req.query.category) query.category = req.query.category;
    if (req.query.date) query.date = req.query.date;
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(String(req.query.search)), "i");
      query.$or = [{ title: regex }, { description: regex }, { category: regex }, { location: regex }];
    }
    if (req.query.minPay) query.paymentAmount = { $gte: Number(req.query.minPay) };

    const workerProfile = req.user.role === "worker" ? await WorkerProfile.findOne({ userId: req.user._id }) : null;
    const shifts = await Shift.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ shifts: await Promise.all(shifts.map((shift) => serializeShift(shift, workerProfile, req.user._id))) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireRole(["employer", "seeker", "admin"]), async (req, res, next) => {
  try {
    const body = shiftSchema.parse(req.body);
    const shift = await Shift.create({ ...body, employerId: req.user._id, status: "published" });
    res.status(201).json({ shift: await serializeShift(shift) });
  } catch (error) {
    next(error);
  }
});

router.post("/parse", requireAuth, requireRole(["employer", "seeker", "admin"]), (req, res, next) => {
  try {
    const text = z.object({ prompt: z.string().min(3) }).parse(req.body).prompt;
    const lower = text.toLowerCase();
    const payment = text.match(/(?:₹|rs\.?|rupees?)\s?(\d+)/i)?.[1] || text.match(/\b(\d{3,5})\b/)?.[1] || "500";
    const workers = text.match(/\b(\d+)\s?(helpers?|workers?|people|staff)\b/i)?.[1] || "1";
    const title = lower.includes("waiter")
      ? "Waiter"
      : lower.includes("shop")
      ? "Shop Helper"
      : lower.includes("clean")
      ? "Deep Cleaning"
      : lower.includes("electric") || lower.includes("wiring")
      ? "Electrician"
      : lower.includes("garden") || lower.includes("lawn")
      ? "Gardener"
      : "Helper";
    res.json({
      parsed: {
        title,
        description: `Flexible ${title.toLowerCase()} shift created from employer request.`,
        category: lower.includes("shop")
          ? "Retail"
          : lower.includes("cafe") || lower.includes("restaurant")
          ? "Cafe"
          : lower.includes("clean")
          ? "Cleaning"
          : lower.includes("electric") || lower.includes("wiring")
          ? "Repairs"
          : lower.includes("garden")
          ? "Gardening"
          : "General",
        requiredSkills: lower.includes("shop")
          ? ["Stocking", "Customer handling"]
          : lower.includes("clean")
          ? ["Deep Cleaning", "Organization"]
          : lower.includes("electric") || lower.includes("wiring")
          ? ["Wiring & Repairs", "Appliance Installation"]
          : lower.includes("garden")
          ? ["Lawn Mowing", "Pruning & Hedging"]
          : ["Customer handling", "Basic communication"],
        workersRequired: Number(workers),
        date: lower.includes("tomorrow") ? new Date(Date.now() + 86400000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        startTime: text.match(/\b(\d{1,2})\s?(am|pm)\b/i)?.[0]?.toUpperCase() || "5 PM",
        endTime: text.match(/to\s?(\d{1,2})\s?(am|pm)\b/i)?.[1] ? `${text.match(/to\s?(\d{1,2})\s?(am|pm)\b/i)[1]} ${text.match(/to\s?(\d{1,2})\s?(am|pm)\b/i)[2].toUpperCase()}` : "9 PM",
        duration: "4h",
        paymentType: "fixed",
        paymentAmount: Number(payment),
        location: "Indiranagar"
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "employer" || req.user.role === "seeker") {
      const shifts = await Shift.find({ employerId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ shifts: await Promise.all(shifts.map((shift) => serializeShift(shift, null, req.user._id))) });
    }

    const applications = await Application.find({ workerId: req.user._id });
    const appliedShiftIds = applications.map((a) => a.shiftId);
    const shifts = await Shift.find({
      $or: [{ _id: { $in: appliedShiftIds } }, { assignedWorkerIds: req.user._id }]
    }).sort({ createdAt: -1 });

    const workerProfile = await WorkerProfile.findOne({ userId: req.user._id });
    const serialized = await Promise.all(shifts.map((shift) => serializeShift(shift, workerProfile, req.user._id)));
    res.json({ shifts: serialized });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    const application = await Application.findOne({ shiftId: shift._id, workerId: req.user._id });
    const canView =
      shift.status === "published" ||
      shift.employerId.equals(req.user._id) ||
      shift.assignedWorkerIds.some((id) => id.equals(req.user._id)) ||
      Boolean(application);
    if (!canView) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const workerProfile = req.user.role === "worker" ? await WorkerProfile.findOne({ userId: req.user._id }) : null;
    res.json({ shift: await serializeShift(shift, workerProfile, req.user._id) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/apply", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (shift.status !== "published") return res.status(409).json({ message: "Shift is not open" });
    if (shift.assignedWorkerIds.length >= shift.workersRequired) return res.status(409).json({ message: "Shift is already full" });

    const application = await Application.create({ shiftId: shift._id, workerId: req.user._id });
    await Notification.create({ userId: shift.employerId, message: `${req.user.name} applied for ${shift.title}` });
    res.status(201).json({ application, message: "Application submitted" });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You already applied for this shift" });
    next(error);
  }
});

router.post("/:id/accept", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    let shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (shift.status !== "published") return res.status(409).json({ message: "Shift is not open" });
    if (shift.assignedWorkerIds.some((id) => id.equals(req.user._id))) {
      return res.status(409).json({ message: "You are already assigned to this shift" });
    }

    shift = await Shift.findOneAndUpdate(
      {
        _id: shift._id,
        status: "published",
        assignedWorkerIds: { $ne: req.user._id },
        $expr: { $lt: [{ $size: "$assignedWorkerIds" }, "$workersRequired"] }
      },
      { $push: { assignedWorkerIds: req.user._id } },
      { returnDocument: "after" }
    );

    if (!shift) return res.status(409).json({ message: "Shift is already full" });

    await Application.findOneAndUpdate(
      { shiftId: shift._id, workerId: req.user._id },
      { status: "accepted", acceptedAt: new Date() },
      { upsert: true, returnDocument: "after" }
    );

    if (shift.assignedWorkerIds.length >= shift.workersRequired) {
      shift = await Shift.findByIdAndUpdate(shift._id, { status: "filled" }, { returnDocument: "after" });
    }

    await Attendance.updateOne(
      { shiftId: shift._id, workerId: req.user._id },
      { $setOnInsert: { status: "scheduled" } },
      { upsert: true }
    );
    await Notification.create({ userId: shift.employerId, message: `${req.user.name} accepted ${shift.title}` });

    const workerProfile = await WorkerProfile.findOne({ userId: req.user._id });
    res.json({ shift: await serializeShift(shift, workerProfile, req.user._id) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/applications", requireAuth, requireRole("employer"), async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (!shift.employerId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    const applications = await Application.find({ shiftId: shift._id }).populate("workerId").sort({ createdAt: -1 });
    res.json({
      applications: await Promise.all(
        applications.map(async (application) => {
          const profile = await WorkerProfile.findOne({ userId: application.workerId._id });
          return {
            id: application._id.toString(),
            status: application.status,
            appliedAt: application.appliedAt,
            worker: application.workerId,
            profile
          };
        })
      )
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/applications/:applicationId", requireAuth, requireRole("employer"), async (req, res, next) => {
  try {
    const body = z.object({ status: z.enum(["accepted", "rejected"]) }).parse(req.body);
    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    let shift = await Shift.findById(application.shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    if (!shift.employerId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    if (body.status === "rejected") {
      application.status = "rejected";
      application.rejectedAt = new Date();
      await application.save();
      return res.json({ application, shift: await serializeShift(shift) });
    }

    const alreadyAssigned = shift.assignedWorkerIds.some((id) => id.equals(application.workerId));
    if (!alreadyAssigned) {
      shift = await Shift.findOneAndUpdate(
        {
          _id: shift._id,
          employerId: req.user._id,
          assignedWorkerIds: { $ne: application.workerId },
          $expr: { $lt: [{ $size: "$assignedWorkerIds" }, "$workersRequired"] }
        },
        { $push: { assignedWorkerIds: application.workerId } },
        { returnDocument: "after" }
      );

      if (!shift) return res.status(409).json({ message: "Shift is already full" });
    }

    application.status = "accepted";
    application.acceptedAt = new Date();
    if (shift.assignedWorkerIds.length >= shift.workersRequired) {
      shift.status = "filled";
      await shift.save();
    }

    await application.save();
    await Attendance.updateOne(
      { shiftId: shift._id, workerId: application.workerId },
      { $setOnInsert: { status: "scheduled" } },
      { upsert: true }
    );
    await Notification.create({ userId: application.workerId, message: `You were accepted for ${shift.title}` });

    res.json({ application, shift: await serializeShift(shift) });
  } catch (error) {
    next(error);
  }
});

export default router;
