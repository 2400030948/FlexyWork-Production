import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    requiredSkills: [{ type: String }],
    workersRequired: { type: Number, default: 1, min: 1 },
    assignedWorkerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: String, required: true },
    paymentType: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    paymentAmount: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    maximumDistance: { type: Number, default: 8 },
    status: {
      type: String,
      enum: ["draft", "published", "filled", "in_progress", "completed", "cancelled"],
      default: "published"
    },
    urgency: { type: String, enum: ["normal", "urgent"], default: "normal" },
    recurring: { type: Boolean, default: false }
  },
  { timestamps: true }
);

shiftSchema.index({ status: 1, category: 1, date: 1 });

export const Shift = mongoose.model("Shift", shiftSchema);
