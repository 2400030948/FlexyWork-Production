import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Community, CooperativeGig } from "../models/Community.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

function serializeCommunity(community) {
  return {
    id: community._id.toString(),
    name: community.name,
    memberCount: community.memberCount,
    rating: community.rating,
    services: community.services || [],
    totalEarnings: community.totalEarnings,
    bannerImage: community.bannerImage,
    logo: community.logo,
    description: community.description,
    activityFeed: (community.activityFeed || []).map((activity) => ({
      id: activity._id.toString(),
      text: activity.text,
      timestamp: activity.timestamp
    }))
  };
}

function serializeCoopGig(gig) {
  return {
    id: gig._id.toString(),
    communityId: gig.communityId.toString(),
    title: gig.title,
    description: gig.description,
    totalPayout: gig.totalPayout,
    workersRequired: gig.workersRequired,
    joinedWorkers: (gig.joinedWorkers || []).map((worker) => ({
      id: worker.workerId?.toString() || worker.name,
      name: worker.name,
      avatarUrl: worker.avatarUrl,
      role: worker.role
    })),
    skillsRequired: gig.skillsRequired || [],
    status: gig.status,
    distribution: gig.distribution
  };
}

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const communities = await Community.find().sort({ memberCount: -1, rating: -1 });
    res.json({ communities: communities.map(serializeCommunity) });
  } catch (error) {
    next(error);
  }
});

router.get("/gigs", requireAuth, async (req, res, next) => {
  try {
    const query = {};
    if (req.query.communityId) query.communityId = req.query.communityId;
    const gigs = await CooperativeGig.find(query).sort({ createdAt: -1 });
    res.json({ coopGigs: gigs.map(serializeCoopGig) });
  } catch (error) {
    next(error);
  }
});

router.get("/gigs/:id", requireAuth, async (req, res, next) => {
  try {
    const gig = await CooperativeGig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Cooperative gig not found" });
    res.json({ coopGig: serializeCoopGig(gig) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    res.json({ community: serializeCommunity(community) });
  } catch (error) {
    next(error);
  }
});

router.post("/gigs/:id/join", requireAuth, requireRole("worker"), async (req, res, next) => {
  try {
    const { requestedSkill } = req.body;
    const gig = await CooperativeGig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Cooperative gig not found" });

    if (gig.joinedWorkers.some((worker) => worker.workerId?.equals(req.user._id))) {
      return res.status(409).json({ message: "You have already joined this cooperative gig." });
    }

    const skillIndex = gig.skillsRequired.findIndex((item) => item.skill.toLowerCase() === String(requestedSkill).toLowerCase());
    if (skillIndex === -1) return res.status(400).json({ message: "Requested skill is not required for this gig." });

    const skill = gig.skillsRequired[skillIndex];
    if (skill.filled >= skill.count) return res.status(409).json({ message: "This role is already filled." });

    skill.filled += 1;
    gig.joinedWorkers.push({
      workerId: req.user._id,
      name: req.user.name,
      avatarUrl: req.user.profileImage,
      role: skill.skill
    });

    const totalRequired = gig.skillsRequired.reduce((sum, item) => sum + item.count, 0);
    const totalFilled = gig.skillsRequired.reduce((sum, item) => sum + item.filled, 0);
    gig.status = totalFilled >= totalRequired ? "filled" : "open";
    await gig.save();

    await Community.findByIdAndUpdate(gig.communityId, {
      $push: {
        activityFeed: {
          $each: [{ text: `${req.user.name} joined ${gig.title} as ${skill.skill}.`, timestamp: "Just now" }],
          $position: 0,
          $slice: 10
        }
      }
    });
    await Notification.create({ userId: req.user._id, message: `You joined ${gig.title} as ${skill.skill}` });

    res.json({ coopGig: serializeCoopGig(gig) });
  } catch (error) {
    next(error);
  }
});

export default router;
