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
import {
  loginLimiter,
  registerLimiter,
  forgotLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();
router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/google-login", validate(googleLoginSchema), googleLogin);
router.post("/forgot-password", forgotLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token",forgotLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
