import express from "express";
import {
  submitFeedback,
  getCourseFeedback,
  getMyFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// GET all reviews for a course (public)
router.route("/").get(getCourseFeedback);

// GET current user's review (protected)
router.route("/my").get(protect, getMyFeedback);

// POST / PUT — submit or update review (protected)
router.route("/").post(protect, submitFeedback);

// DELETE own review (protected)
router.route("/").delete(protect, deleteFeedback);

export default router;
