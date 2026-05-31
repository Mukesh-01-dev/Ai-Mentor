import { z } from "zod";
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});
