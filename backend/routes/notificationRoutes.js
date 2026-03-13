import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.delete("/clear", protect, clearAll);
router.patch("/:id/read", protect, markAsRead);

export default router;
