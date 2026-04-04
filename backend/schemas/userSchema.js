import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
});

export const purchaseCourseSchema = z.object({
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  courseTitle: z.string().min(1, "Course title is required"),
});

export const courseProgressSchema = z.object({
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  lessonData: z.object({
    lessonId: z.string().min(1, "Lesson ID is required"),
    data: z.record(z.any()),
  }).optional(),
  currentLesson: z.string().optional(),
  completedLesson: z.object({
    lessonId: z.string().min(1, "Lesson ID is required"),
    completedAt: z.string().or(z.date()).optional(),
  }).optional(),
});

export const updateSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
  }).optional(),
  security: z.object({
    twoFactor: z.boolean().optional(),
  }).optional(),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
  }).optional(),
});

export const removeCourseSchema = z.object({
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
});
