import express from "express";
import {
  getUserAnalytics,
  recordStudySession,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { recordStudySessionSchema } from "../schemas/analyticsSchema.js";

const router = express.Router();

router.route("/").get(protect, getUserAnalytics);
router.route("/study-session").post(protect, validate(recordStudySessionSchema), recordStudySession);

export default router;
