import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, select: false },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["worker", "employer", "seeker", "admin"], required: true },
    roles: [{ type: String, enum: ["worker", "employer", "seeker", "admin"] }],
    profileImage: String,
    phone: String,
    location: { type: String, default: "Indiranagar" }
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
