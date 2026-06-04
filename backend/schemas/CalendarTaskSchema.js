import { z } from "zod";
export const createCalendarTaskSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    text: z.string().min(1, "Task text cannot be empty"),
    status: z.enum(["Upcoming", "Ongoing", "Completed"]).optional(),
});
export const updateCalendarTaskSchema = z.object({
    text: z.string().min(1, "Task text cannot be empty").optional(),
    status: z.enum(["Upcoming", "Ongoing", "Completed"]).optional(),
});
