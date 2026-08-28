import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" }
  },
  { timestamps: true }
);

ratingSchema.index({ shiftId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
