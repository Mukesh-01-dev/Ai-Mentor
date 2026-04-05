import { z } from "zod";

export const generateVideoSchema = z.object({
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  lessonId: z.string().min(1, "Lesson ID is required"),
  celebrity: z.string().min(1, "Celebrity name is required"),
});
