import { z } from "zod";

export const createPostSchema = z.object({
  type: z.enum(["course", "global"]),
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  courseName: z.string().optional(),
  category: z.string().optional(),
  content: z.string().min(1, "Post content is required"),
}).refine((data) => {
  if (data.type === "course") {
    return !!data.courseId && !!data.courseName;
  }
  if (data.type === "global") {
    return !!data.category;
  }
  return true;
}, {
  message: "courseId and courseName are required for course posts, category for global posts",
  path: ["type"],
});

export const editPostSchema = z.object({
  content: z.string().min(1, "Post content is required"),
});

export const replySchema = z.object({
  text: z.string().min(1, "Reply text is required"),
});

export const editReplySchema = z.object({
  text: z.string().min(1, "Reply text is required"),
});

export const reportContentSchema = z.object({
  replyId: z.string().uuid().optional().or(z.string().optional()), // UUID or string ID
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

export const moderateReportSchema = z.object({
  action: z.enum(["hidden", "deleted", "dismissed"]),
});
