import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    status: { type: String, enum: ["Available", "Unavailable", "Limited"], default: "Unavailable" },
    ranges: [{ type: String }]
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: [{ type: String }],
    experience: { type: String, default: "Local shift work" },
    bio: String,
    expectedHourlyWage: { type: Number, default: 125 },
    availability: [availabilitySchema],
    rating: { type: Number, default: 4.8 },
    reliabilityScore: { type: Number, default: 94 },
    completedShifts: { type: Number, default: 0 },
    location: { type: String, default: "Indiranagar" },
    latitude: Number,
    longitude: Number
  },
  { timestamps: true }
);

const employerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true },
    businessType: { type: String, default: "Local business" },
    description: String,
    location: { type: String, default: "Indiranagar" },
    verificationStatus: { type: String, enum: ["pending", "verified"], default: "verified" },
    rating: { type: Number, default: 4.7 }
  },
  { timestamps: true }
);

export const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);
export const EmployerProfile = mongoose.model("EmployerProfile", employerProfileSchema);
