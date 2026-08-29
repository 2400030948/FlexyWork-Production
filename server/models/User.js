import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, select: false },
    googleId: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["worker", "employer", "admin"], required: true },
    roles: [{ type: String, enum: ["worker", "employer", "admin"] }],
    profileImage: String,
    phone: String,
    location: { type: String, default: "Indiranagar" },
    // Seekers (employers) persist their current location here so we can
    // rank workers by proximity without storing history. Both fields are
    // optional — existing records and users who never grant location
    // permission continue to work without modification.
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    locationUpdatedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Compound geo index supports the bounding-box query in services/geo.js
userSchema.index({ latitude: 1, longitude: 1 });

userSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    // Never leak raw GPS coordinates through any default JSON
    // serialisation path. Specific endpoints (seeker updating their own
    // location) read the document directly with the coordinates intact.
    if (ret.latitude !== undefined) delete ret.latitude;
    if (ret.longitude !== undefined) delete ret.longitude;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
