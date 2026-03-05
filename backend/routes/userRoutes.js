import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getWatchedVideos,
  updateUserSettings,
  searchUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { removePurchasedCourse } from "../controllers/userController.js";

const router = express.Router();

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/purchase-course").post(protect, purchaseCourse);
router.route("/course-progress").put(protect, updateCourseProgress);
router.route("/watched-videos").get(protect, getWatchedVideos);
router.route("/settings").put(protect, updateUserSettings);
router.route("/remove-course").post(protect, removePurchasedCourse);
router.get("/search",searchUsers);

export default router;
