// backend/routes/userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getWatchedVideos,
  getUserSettings,
  updateUserSettings,
  removePurchasedCourse,
  deleteAccount,
  changePassword
} from "../controllers/userController.js";

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

/* ---------- AUTH ROUTES ---------- */

router.post("/register", registerUser);
router.post("/login", loginUser);

/* ---------- USER ROUTES ---------- */

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

router.put("/change-password", protect, changePassword);

router.post("/purchase-course", protect, purchaseCourse);

router.put("/course-progress", protect, updateCourseProgress);

router.get("/watched-videos", protect, getWatchedVideos);

router.route("/settings")
  .get(protect, getUserSettings)
  .put(protect, updateUserSettings);

router.post("/remove-course", protect, removePurchasedCourse);

router.delete("/delete-account", protect, deleteAccount);

export default router;