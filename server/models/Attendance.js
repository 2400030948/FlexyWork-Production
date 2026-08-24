import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkInAt: Date,
    checkOutAt: Date,
    status: { type: String, enum: ["scheduled", "checked_in", "completed"], default: "scheduled" },
    durationMinutes: Number
  },
  { timestamps: true }
);

attendanceSchema.index({ shiftId: 1, workerId: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
