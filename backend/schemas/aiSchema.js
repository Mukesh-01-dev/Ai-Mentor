import { z } from "zod";

export const generateVideoSchema = z.object({
  courseId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  lessonId: z.union([z.string(), z.number()]).transform((val) => String(val)),
  celebrity: z.string().min(1, "Celebrity name is required"),
});