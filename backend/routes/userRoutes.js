// backend/routes/userRoutes.js

import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  updateProfileSchema,
  changePasswordSchema,
  purchaseCourseSchema,
  courseProgressSchema,
  updateSettingsSchema,
  removeCourseSchema,
} from "../schemas/userSchema.js";

import {
  getUserProfile,
  updateUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getWatchedVideos,
  getUserSettings,
  updateUserSettings,
  removePurchasedCourse,
  deleteAccount,
  completeProfile,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

/* ================= MULTER ================= */
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

/* ================= USER PROFILE ================= */
router.route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    upload.single("avatar"),
    validate(updateProfileSchema),
    updateUserProfile
  );

/* ================= COMPLETE PROFILE ================= */
router.post(
  "/complete-profile",
  protect,
  upload.single("avatar"),
  completeProfile
);

/* ================= PASSWORD ================= */
router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);

/* ================= COURSES ================= */
router.post(
  "/purchase-course",
  protect,
  validate(purchaseCourseSchema),
  purchaseCourse
);

router.put(
  "/course-progress",
  protect,
  validate(courseProgressSchema),
  updateCourseProgress
);

router.get("/watched-videos", protect, getWatchedVideos);

/* ================= SETTINGS ================= */
router.route("/settings")
  .get(protect, getUserSettings)
  .put(protect, validate(updateSettingsSchema), updateUserSettings);

/* ================= REMOVE COURSE ================= */
router.post(
  "/remove-course",
  protect,
  validate(removeCourseSchema),
  removePurchasedCourse
);

/* ================= DELETE ACCOUNT ================= */
router.delete("/delete-account", protect, deleteAccount);

export default router;