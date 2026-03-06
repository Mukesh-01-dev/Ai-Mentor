// backend/routes/userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getUserProfile,
  updateUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getWatchedVideos,
  getUserSettings,
  updateUserSettings,
  removePurchasedCourse,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

router.route("/purchase-course").post(protect, purchaseCourse);
router.route("/course-progress").put(protect, updateCourseProgress);
router.route("/watched-videos").get(protect, getWatchedVideos);
router.route("/settings").get(protect, getUserSettings).put(protect, updateUserSettings);
router.route("/remove-course").post(protect, removePurchasedCourse);

export default router;
