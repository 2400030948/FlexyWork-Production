import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { WorkerProfile } from "../models/Profile.js";

function getToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.flexywork_token;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch {}
  next();
}

export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userRole = req.user.role;
    const normalizedAllowed = roles.map((r) => (r === "seeker" ? "employer" : r));
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

/**
 * Computes the overall worker verification status from the worker's certifications.
 * Rules (MVP):
 *   - unverified : no certifications submitted
 *   - pending    : at least one certificate exists but none is verified
 *   - rejected   : latest certificate is rejected (and no approved certs exist)
 *   - approved   : at least one certificate is verified by an admin
 */
export function computeWorkerVerificationStatus(profile) {
  const certs = profile?.certifications || [];
  if (!certs.length) return "unverified";
  const hasApproved = certs.some((c) => c.verificationStatus === "verified");
  if (hasApproved) return "approved";
  const hasPending = certs.some((c) => c.verificationStatus === "pending");
  if (hasPending) return "pending";
  const hasRejected = certs.some((c) => c.verificationStatus === "rejected");
  if (hasRejected) return "rejected";
  return "unverified";
}

/**
 * Recomputes the derived `isVerified` flag on a worker profile based on the
 * presence of at least one admin-verified certificate, and persists it.
 * Returns the updated profile.
 */
export async function syncWorkerVerification(profile) {
  if (!profile) return profile;
  const status = computeWorkerVerificationStatus(profile);
  profile.isVerified = status === "approved";
  await profile.save();
  profile.workerVerificationStatus = status;
  return profile;
}

/**
 * Hard backend gate that prevents unapproved workers from performing
 * protected worker-side gig actions (apply, accept, check-in, check-out).
 * Returns 403 with a clear message instead of letting the request through.
 */
export async function requireVerifiedWorker(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "worker") return res.status(403).json({ message: "Forbidden" });

    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });

    const status = computeWorkerVerificationStatus(profile);
    if (status !== "approved") {
      return res.status(403).json({
        message: "Worker verification required before accessing gigs.",
        code: "WORKER_NOT_VERIFIED",
        verificationStatus: status
      });
    }

    req.workerProfile = profile;
    next();
  } catch (error) {
    next(error);
  }
}
