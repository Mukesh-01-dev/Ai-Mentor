import { z } from "zod";

export const adminPasswordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" });

// The Bouncer rules for Login
export const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(1, { message: "Password is required" })
});

// The Bouncer rules for Registration
export const adminRegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address format" }),
  password: adminPasswordSchema
});