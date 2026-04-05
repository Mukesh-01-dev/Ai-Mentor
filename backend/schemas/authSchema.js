import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});
