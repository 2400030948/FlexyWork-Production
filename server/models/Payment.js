import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "marked_paid", "cancelled"], default: "pending" },
    paidAt: Date
  },
  { timestamps: true }
);

paymentSchema.index({ shiftId: 1, workerId: 1 }, { unique: true });

export const Payment = mongoose.model("Payment", paymentSchema);
