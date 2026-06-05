import { z } from "zod";

export const createPostSchema = z
  .object({
    type: z.enum(["course", "global"]),
    courseId: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional(),
    courseName: z
      .string()
      .max(100, "Course name cannot exceed 100 characters")
      .optional(),
    category: z
      .string()
      .max(50, "Category cannot exceed 50 characters")
      .optional(),
    content: z
      .string()
      .min(1, "Post content is required")
      .max(2000, "Post content cannot exceed 2000 characters"),
  })
  .refine(
    (data) => {
      if (data.type === "course") {
        return !!data.courseId && !!data.courseName;
      }
      if (data.type === "global") {
        return !!data.category;
      }
      return true;
    },
    {
      message:
        "courseId and courseName are required for course posts, category for global posts",
      path: ["type"],
    },
  );

export const editPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(2000, "Post content cannot exceed 2000 characters"),
});

export const replySchema = z.object({
  text: z
    .string()
    .min(1, "Reply text is required")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

export const editReplySchema = z.object({
  text: z
    .string()
    .min(1, "Reply text is required")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

export const reportContentSchema = z.object({
  replyId: z.string().uuid().optional().or(z.string().optional()),

  reason: z
    .string()
    .min(1, "Reason is required")
    .max(200, "Reason cannot exceed 200 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const moderateReportSchema = z.object({
  action: z.enum(["hidden", "deleted", "dismissed"]),
});
