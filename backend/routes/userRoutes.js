// backend/routes/userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  purchaseCourseSchema,
  courseProgressSchema,
  updateSettingsSchema,
  removeCourseSchema,
} from "../schemas/userSchema.js";

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

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

/* ---------- USER ROUTES ---------- */

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), validate(updateProfileSchema), updateUserProfile);

router.put("/change-password", protect, validate(changePasswordSchema), changePassword);

router.post("/purchase-course", protect, validate(purchaseCourseSchema), purchaseCourse);

router.put("/course-progress", protect, validate(courseProgressSchema), updateCourseProgress);

router.get("/watched-videos", protect, getWatchedVideos);

router.route("/settings")
  .get(protect, getUserSettings)
  .put(protect, validate(updateSettingsSchema), updateUserSettings);

router.post("/remove-course", protect, validate(removeCourseSchema), removePurchasedCourse);

router.delete("/delete-account", protect, deleteAccount);

export default router;