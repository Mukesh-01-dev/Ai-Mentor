import { z } from "zod";

export const studySessionSchema = z.object({
  hours: z
    .number({
      required_error: "Hours is required",
      invalid_type_error: "Hours must be a number",
    })
    .gt(0, "Hours must be greater than 0")
    .lte(24, "Hours cannot be greater than 24"),
  date: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});
