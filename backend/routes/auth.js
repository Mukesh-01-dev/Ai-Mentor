import express from "express";
import validate from "../middleware/validate.js";

import {
  registerSchema,
  loginSchema,
} from "../schemas/authSchema.js";

import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

/* ================= AUTH ROUTES ================= */

// Register
router.post(
  "/register",
  validate(registerSchema),
  register
);

// Login
router.post(
  "/login",
  validate(loginSchema),
  login
);

// Google Login
router.post(
  "/google-login",
  googleLogin
);

// Forgot Password
router.post(
  "/forgot-password",
  forgotPassword
);

// Reset Password
router.put(
  "/reset-password/:token",
  resetPassword
);

export default router;