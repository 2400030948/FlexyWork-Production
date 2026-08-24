import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending" },
    appliedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    rejectedAt: Date
  },
  { timestamps: true }
);

applicationSchema.index({ shiftId: 1, workerId: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
