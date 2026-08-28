import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) } // 10 minutes
  },
  { timestamps: true }
);

// TTL index to automatically delete expired OTP records after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);
