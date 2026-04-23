import express from "express";
import {
    getUnreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/unread-count", protect, getUnreadCount);
router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.delete("/clear", protect, clearAll);
router.patch("/:id/read", protect, markAsRead);

export default router;