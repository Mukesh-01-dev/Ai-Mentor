import { z } from "zod";

// The Bouncer rules for Login
export const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

// The Bouncer rules for Registration
export const adminRegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});