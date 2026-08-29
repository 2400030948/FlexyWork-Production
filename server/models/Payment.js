import mongoose from "mongoose";

/**
 * Payment record for a (shift, worker) pair.
 *
 * Lifecycle (typical direct-payout flow):
 *   pending       -> order created, awaiting checkout
 *   authorized    -> Razorpay order created, awaiting client checkout
 *   marked_paid   -> payment captured and signature verified
 *   failed        -> payment failed at gateway or signature mismatch
 *   cancelled     -> manually cancelled (admin / employer)
 */
const paymentSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "authorized", "marked_paid", "failed", "cancelled"],
      default: "pending"
    },
    paidAt: Date,

    // Razorpay specific fields. We never store the secret on a record.
    gateway: { type: String, default: "razorpay" },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    razorpayError: { type: String },

    // Free-form notes / metadata attached to the Razorpay order
    notes: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

paymentSchema.index({ shiftId: 1, workerId: 1 }, { unique: true });

export const Payment = mongoose.model("Payment", paymentSchema);
