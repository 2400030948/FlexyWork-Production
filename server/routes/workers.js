import express from "express";
import { z } from "zod";
import { requireAuth, requireRole, computeWorkerVerificationStatus } from "../middleware/auth.js";
import { WorkerProfile } from "../models/Profile.js";
import { User } from "../models/User.js";

const router = express.Router();
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeCertification(cert) {
  if (!cert) return null;
  return {
    id: cert._id.toString(),
    title: cert.title,
    issuingOrganization: cert.issuingOrganization,
    issueDate: cert.issueDate || "",
    expiryDate: cert.expiryDate || "",
    credentialId: cert.credentialId || "",
    description: cert.description || "",
    documentUrl: cert.documentUrl || "",
    verificationStatus: cert.verificationStatus || "pending",
    verifiedAt: cert.verifiedAt ? cert.verifiedAt.toISOString() : null,
    rejectionReason: cert.rejectionReason || ""
  };
}

function serializeExperience(exp) {
  if (!exp) return null;
  return {
    id: exp._id.toString(),
    jobTitle: exp.jobTitle,
    organization: exp.organization,
    startDate: exp.startDate || "",
    endDate: exp.endDate || "",
    currentlyWorking: !!exp.currentlyWorking,
    description: exp.description || "",
    skills: exp.skills || []
  };
}

function serializeWorker(profile, user) {
  const status = computeWorkerVerificationStatus(profile);
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    name: user?.name || "FlexyWork Provider",
    email: user?.email || "",
    phone: user?.phone || "+91 98765 43210",
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
    // isVerified is always derived from the certificate approval status so it
    // can never disagree with the worker's overall verification state.
    isVerified: status === "approved",
    workerVerificationStatus: status,
    isTopRated: (profile.rating || 0) >= 4.8,
    avatarUrl: user?.profileImage,
    certifications: (profile.certifications || []).map(serializeCertification).filter(Boolean),
    workExperiences: (profile.workExperiences || []).map(serializeExperience).filter(Boolean)
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
  phone: z.string().optional(),
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

// Helper: ensure the authenticated worker can only operate on their own profile.
async function getOwnProfile(req, res) {
  const profile = await WorkerProfile.findOne({ userId: req.user._id });
  if (!profile) {
    res.status(404).json({ message: "Worker profile not found" });
    return null;
  }
  return profile;
}

const certificationPayload = z.object({
  title: z.string().min(2).max(120),
  issuingOrganization: z.string().min(2).max(120),
  issueDate: z.string().min(2).max(20),
  expiryDate: z.string().max(20).optional().default(""),
  credentialId: z.string().max(80).optional().default(""),
  description: z.string().max(1000).optional().default(""),
  documentUrl: z.string().max(500).optional().default("")
});

const experiencePayload = z.object({
  jobTitle: z.string().min(2).max(120),
  organization: z.string().min(2).max(120),
  startDate: z.string().min(2).max(20),
  endDate: z.string().max(20).optional().default(""),
  currentlyWorking: z.boolean().optional().default(false),
  description: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().max(60)).optional().default([])
});

router.get("/", async (req, res, next) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid query parameters" });
    const { search, category, minRating } = parsed.data;

    const query = {};
    if (category) query.skills = { $in: [category] };
    if (minRating !== undefined) query.rating = { $gte: minRating };
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ bio: regex }, { experience: regex }, { location: regex }, { skills: regex }];
    }

    const profiles = await WorkerProfile.find(query).limit(50);
    const workers = await serializeWorkers(profiles);
    // Per trust barrier: only show APPROVED workers to seekers/employers.
    const filtered = workers.filter((w) => w.workerVerificationStatus === "approved");
    res.json({ workers: filtered });
  } catch (error) {
    next(error);
  }
});

router.get("/me/verification-status", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });
    const status = computeWorkerVerificationStatus(profile);
    const latestRejection = (profile.certifications || [])
      .filter((c) => c.verificationStatus === "rejected")
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
    res.json({
      workerVerificationStatus: status,
      isVerified: status === "approved",
      certifications: (profile.certifications || []).map(serializeCertification).filter(Boolean),
      latestRejectionReason: latestRejection?.rejectionReason || ""
    });
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
    if (body.phone) userUpdates.phone = body.phone;
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

// ============= CERTIFICATIONS =============

router.get("/me/certifications", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req, res);
    if (!profile) return;
    res.json({ certifications: (profile.certifications || []).map(serializeCertification) });
  } catch (error) {
    next(error);
  }
});

router.post("/me/certifications", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const body = certificationPayload.parse(req.body);
    const profile = await getOwnProfile(req, res);
    if (!profile) return;

    // Workers can NEVER set verificationStatus to "verified". Always reset to pending.
    profile.certifications.push({
      title: body.title,
      issuingOrganization: body.issuingOrganization,
      issueDate: body.issueDate,
      expiryDate: body.expiryDate || "",
      credentialId: body.credentialId || "",
      description: body.description || "",
      documentUrl: body.documentUrl || "",
      verificationStatus: "pending",
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: ""
    });

    await profile.save();
    const created = profile.certifications[profile.certifications.length - 1];
    res.status(201).json({ certification: serializeCertification(created) });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/me/certifications/:certId",
  requireAuth,
  requireRole("worker"),
  async (req, res, next) => {
    try {
      if (!objectIdPattern.test(req.params.certId)) {
        return res.status(404).json({ message: "Certification not found" });
      }
      const body = certificationPayload.parse(req.body);
      const profile = await getOwnProfile(req, res);
      if (!profile) return;

      const cert = profile.certifications.id(req.params.certId);
      if (!cert) return res.status(404).json({ message: "Certification not found" });

      cert.title = body.title;
      cert.issuingOrganization = body.issuingOrganization;
      cert.issueDate = body.issueDate;
      cert.expiryDate = body.expiryDate || "";
      cert.credentialId = body.credentialId || "";
      cert.description = body.description || "";
      cert.documentUrl = body.documentUrl || "";

      // If the worker edits a previously verified certificate, force review again.
      if (cert.verificationStatus === "verified") {
        cert.verificationStatus = "pending";
        cert.verifiedAt = null;
        cert.verifiedBy = null;
        cert.rejectionReason = "";
      }

      await profile.save();
      res.json({ certification: serializeCertification(cert) });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/me/certifications/:certId",
  requireAuth,
  requireRole("worker"),
  async (req, res, next) => {
    try {
      if (!objectIdPattern.test(req.params.certId)) {
        return res.status(404).json({ message: "Certification not found" });
      }
      const profile = await getOwnProfile(req, res);
      if (!profile) return;

      const cert = profile.certifications.id(req.params.certId);
      if (!cert) return res.status(404).json({ message: "Certification not found" });

      cert.deleteOne();
      await profile.save();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }
);

// ============= EXPERIENCE =============

router.get("/me/experience", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req, res);
    if (!profile) return;
    res.json({ experiences: (profile.workExperiences || []).map(serializeExperience) });
  } catch (error) {
    next(error);
  }
});

router.post("/me/experience", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const body = experiencePayload.parse(req.body);
    const profile = await getOwnProfile(req, res);
    if (!profile) return;

    profile.workExperiences.push({
      jobTitle: body.jobTitle,
      organization: body.organization,
      startDate: body.startDate,
      endDate: body.currentlyWorking ? "" : (body.endDate || ""),
      currentlyWorking: !!body.currentlyWorking,
      description: body.description || "",
      skills: body.skills || []
    });

    await profile.save();
    const created = profile.workExperiences[profile.workExperiences.length - 1];
    res.status(201).json({ experience: serializeExperience(created) });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/me/experience/:expId",
  requireAuth,
  requireRole("worker"),
  async (req, res, next) => {
    try {
      if (!objectIdPattern.test(req.params.expId)) {
        return res.status(404).json({ message: "Experience not found" });
      }
      const body = experiencePayload.parse(req.body);
      const profile = await getOwnProfile(req, res);
      if (!profile) return;

      const exp = profile.workExperiences.id(req.params.expId);
      if (!exp) return res.status(404).json({ message: "Experience not found" });

      exp.jobTitle = body.jobTitle;
      exp.organization = body.organization;
      exp.startDate = body.startDate;
      exp.endDate = body.currentlyWorking ? "" : (body.endDate || "");
      exp.currentlyWorking = !!body.currentlyWorking;
      exp.description = body.description || "";
      exp.skills = body.skills || [];

      await profile.save();
      res.json({ experience: serializeExperience(exp) });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/me/experience/:expId",
  requireAuth,
  requireRole("worker"),
  async (req, res, next) => {
    try {
      if (!objectIdPattern.test(req.params.expId)) {
        return res.status(404).json({ message: "Experience not found" });
      }
      const profile = await getOwnProfile(req, res);
      if (!profile) return;

      const exp = profile.workExperiences.id(req.params.expId);
      if (!exp) return res.status(404).json({ message: "Experience not found" });

      exp.deleteOne();
      await profile.save();
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  }
);

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