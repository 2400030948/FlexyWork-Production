import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";

const router = express.Router();

function serializeNotification(notification) {
  return {
    id: notification._id.toString(),
    userId: notification.userId.toString(),
    title: "FlexyWork update",
    message: notification.message,
    timestamp: notification.createdAt ? notification.createdAt.toISOString() : new Date().toISOString(),
    read: notification.read,
    type: "gig"
  };
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(25);
    res.json({ notifications: notifications.map(serializeNotification) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { returnDocument: "after" }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: serializeNotification(notification) });
  } catch (error) {
    next(error);
  }
});

export default router;
