import { z } from "zod";

export const recordStudySessionSchema = z.object({
  hours: z.number().positive("Hours must be a positive number"),
  date: z.string().or(z.date()).optional(),
});
