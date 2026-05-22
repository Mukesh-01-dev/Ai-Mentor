import express from "express";
import validate from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from "../schemas/authSchema.js";
import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// --- NEW IMPORTS FOR PROFILE COMPLETION ---
import { completeProfile } from "../controllers/userController.js";
import { completeProfileSchema } from "../schemas/userSchema.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Debug middleware to see incoming requests in terminal
router.use((req, res, next) => {
  console.log(`📩 Auth Route Hit: ${req.method} ${req.url}`);
  next();
});

// --- EXISTING ROUTES ---
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google-login", validate(googleLoginSchema), googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// --- NEW ROUTE: COMPLETE PROFILE ---
// This handles: POST /api/users/complete-profile
router.post(
  "/complete-profile",
  protect,              // Ensures user is logged in
  upload.single("avatar"), // Handles the profile picture upload
  validate(completeProfileSchema), // Checks bio and other fields
  completeProfile       // Saves to database
);

export default router;