import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { WorkerProfile } from "../models/Profile.js";
import { Shift } from "../models/Shift.js";
import { User } from "../models/User.js";

const router = express.Router();

function uiRole(role) {
  return role === "employer" ? "seeker" : role;
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: uiRole(user.role),
    location: user.location,
    avatarUrl: user.profileImage,
    createdAt: user.createdAt?.toISOString()
  };
}

function serializeWorker(profile, user) {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    name: user?.name || "FlexyWork Provider",
    email: user?.email || "",
    skills: profile.skills || [],
    bio: profile.bio || profile.experience || "Reliable local service provider.",
    location: profile.location || user?.location || "Vijayawada",
    distance: 1.2,
    rating: profile.rating || 4.8,
    completedGigsCount: profile.completedShifts || 0,
    reliabilityScore: profile.reliabilityScore || 94,
    responseTime: "Within 1 hour",
    hourlyRate: profile.expectedHourlyWage || 200,
    availability: profile.availability || [],
    isVerified: profile.isVerified ?? true,
    isTopRated: (profile.rating || 0) >= 4.8,
    avatarUrl: user?.profileImage
  };
}

function serializeShift(shift, employer) {
  const statusMap = {
    draft: "REQUESTED",
    published: "REQUESTED",
    filled: "ACCEPTED",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "DECLINED"
  };

  return {
    id: shift._id.toString(),
    title: shift.title,
    description: shift.description,
    category: shift.category,
    requiredSkills: shift.requiredSkills,
    workersRequired: shift.workersRequired,
    filledCount: shift.assignedWorkerIds.length,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    time: `${shift.startTime} - ${shift.endTime}`,
    duration: shift.duration,
    paymentType: shift.paymentType,
    paymentAmount: shift.paymentAmount,
    location: shift.location,
    urgency: shift.urgency,
    status: statusMap[shift.status] || "REQUESTED",
    employerId: shift.employerId.toString(),
    employerName: employer?.name || "Local employer",
    assignedWorkerIds: shift.assignedWorkerIds.map((id) => id.toString())
  };
}

router.get("/dashboard", requireAuth, requireRole("admin"), async (_req, res, next) => {
  try {
    const [users, profiles, shifts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(100),
      WorkerProfile.find().sort({ rating: -1, reliabilityScore: -1 }).limit(100),
      Shift.find().sort({ createdAt: -1 }).limit(100)
    ]);

    const userIds = [...profiles.map((profile) => profile.userId), ...shifts.map((shift) => shift.employerId)];
    const relatedUsers = await User.find({ _id: { $in: userIds } });
    const usersById = new Map(relatedUsers.map((user) => [user._id.toString(), user]));

    res.json({
      users: users.map(serializeUser),
      workers: profiles.map((profile) => serializeWorker(profile, usersById.get(profile.userId.toString()))),
      shifts: shifts.map((shift) => serializeShift(shift, usersById.get(shift.employerId.toString())))
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/workers/:id/verification", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });

    profile.isVerified = !(profile.isVerified ?? true);
    await profile.save();

    const user = await User.findById(profile.userId);
    res.json({ worker: serializeWorker(profile, user) });
  } catch (error) {
    next(error);
  }
});

export default router;
