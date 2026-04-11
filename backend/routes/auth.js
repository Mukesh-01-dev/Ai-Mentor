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

const router = express.Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google-login", validate(googleLoginSchema), googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

export default router;
