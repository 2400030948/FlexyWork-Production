import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

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

export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userRole = req.user.role === "seeker" ? "employer" : req.user.role;
    const normalizedAllowed = roles.map((r) => (r === "seeker" ? "employer" : r));
    if (!normalizedAllowed.includes(userRole) && !normalizedAllowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
