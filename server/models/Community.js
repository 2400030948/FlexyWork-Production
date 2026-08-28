import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    timestamp: { type: String, default: "Just now" }
  },
  { _id: true }
);

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    memberCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.7 },
    services: [{ type: String }],
    totalEarnings: { type: Number, default: 0 },
    bannerImage: String,
    logo: { type: String, default: "FW" },
    description: String,
    activityFeed: [activitySchema]
  },
  { timestamps: true }
);

const joinedWorkerSchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    avatarUrl: String,
    role: { type: String, required: true }
  },
  { _id: false }
);

const skillRequirementSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    filled: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const cooperativeGigSchema = new mongoose.Schema(
  {
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    totalPayout: { type: Number, required: true, min: 1 },
    workersRequired: { type: Number, required: true, min: 1 },
    joinedWorkers: [joinedWorkerSchema],
    skillsRequired: [skillRequirementSchema],
    status: { type: String, enum: ["open", "filled", "in_progress", "completed"], default: "open" },
    distribution: String
  },
  { timestamps: true }
);

export const Community = mongoose.model("Community", communitySchema);
export const CooperativeGig = mongoose.model("CooperativeGig", cooperativeGigSchema);
