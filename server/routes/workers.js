import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { WorkerProfile } from "../models/Profile.js";
import { User } from "../models/User.js";

const router = express.Router();
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

async function serializeWorkers(profiles) {
  const userIds = profiles.map((profile) => profile.userId);
  const users = await User.find({ _id: { $in: userIds } });
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));
  return profiles.map((profile) => serializeWorker(profile, usersById.get(profile.userId.toString())));
}

const availabilityPayload = z.object({
  availability: z.array(
    z.object({
      day: z.string(),
      status: z.enum(["Available", "Unavailable", "Limited"]),
      ranges: z.array(z.string())
    })
  ),
  dateOverrides: z
    .array(
      z.object({
        date: z.string(),
        status: z.enum(["Available", "Unavailable", "Limited"]),
        ranges: z.array(z.string())
      })
    )
    .optional(),
  unavailablePeriods: z
    .array(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string().optional()
      })
    )
    .optional()
});

const profilePayload = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().min(2).optional(),
  hourlyRate: z.coerce.number().min(1).optional(),
  location: z.string().min(2).optional(),
  skills: z.array(z.string()).optional()
});

const searchQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional()
});

router.get("/", async (req, res, next) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid query parameters" });
    const { search, category, minRating } = parsed.data;

    const query = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }],
        role: "worker"
      });
      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { skills: regex },
        { bio: regex },
        { experience: regex },
        { location: regex },
        { userId: { $in: userIds } }
      ];
    }
    if (category) {
      // Use $and to combine with existing $or from search without overwriting
      const categoryRegex = new RegExp(escapeRegex(category), "i");
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { skills: categoryRegex }];
        delete query.$or;
      } else {
        query.skills = categoryRegex;
      }
    }
    if (minRating !== undefined) {
      query.rating = { $gte: minRating };
    }

    const profiles = await WorkerProfile.find(query).sort({ rating: -1, reliabilityScore: -1 }).limit(50);
    res.json({ workers: await serializeWorkers(profiles) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });
    res.json({ worker: serializeWorker(profile, req.user) });
  } catch (error) {
    next(error);
  }
});

router.put("/me", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const body = profilePayload.parse(req.body);
    const profileUpdates = {};
    const userUpdates = {};

    if (body.name) userUpdates.name = body.name;
    if (body.location) {
      userUpdates.location = body.location;
      profileUpdates.location = body.location;
    }
    if (body.bio) profileUpdates.bio = body.bio;
    if (body.hourlyRate) profileUpdates.expectedHourlyWage = body.hourlyRate;
    if (body.skills) profileUpdates.skills = body.skills;

    const [user, profile] = await Promise.all([
      Object.keys(userUpdates).length
        ? User.findByIdAndUpdate(req.user._id, userUpdates, { returnDocument: "after" })
        : req.user,
      WorkerProfile.findOneAndUpdate({ userId: req.user._id }, profileUpdates, { returnDocument: "after" })
    ]);

    if (!profile) return res.status(404).json({ message: "Worker profile not found" });
    res.json({ worker: serializeWorker(profile, user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me/availability", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    res.json({
      availability: profile?.availability || [],
      dateOverrides: profile?.dateOverrides || [],
      unavailablePeriods: profile?.unavailablePeriods || []
    });
  } catch (error) {
    next(error);
  }
});

router.put("/me/availability", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const body = availabilityPayload.parse(req.body);
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        availability: body.availability,
        dateOverrides: body.dateOverrides || [],
        unavailablePeriods: body.unavailablePeriods || []
      },
      { returnDocument: "after" }
    );
    res.json({
      availability: profile.availability,
      dateOverrides: profile.dateOverrides,
      unavailablePeriods: profile.unavailablePeriods
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!objectIdPattern.test(req.params.id)) return res.status(404).json({ message: "Worker profile not found" });

    const profile = await WorkerProfile.findOne({ $or: [{ _id: req.params.id }, { userId: req.params.id }] });
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });

    const user = await User.findById(profile.userId);
    res.json({ worker: serializeWorker(profile, user) });
  } catch (error) {
    next(error);
  }
});

export default router;
