import { z } from "zod";

export const addCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  level: z.string().optional(),
  price: z.number().nonnegative().optional(),
  image: z.string().url().optional(),
  description: z.string().optional(),
});

export const addModulesSchema = z.object({
  modules: z.array(z.object({
    title: z.string().min(1, "Module title is required"),
    lessons: z.array(z.any()).optional(),
  })),
});

export const addLessonsSchema = z.object({
  lessons: z.array(z.object({
    id: z.string().min(1, "Lesson ID is required"),
    title: z.string().min(1, "Lesson title is required"),
    videoUrl: z.string().url().optional(),
  })),
});

export const updateLessonVideoSchema = z.object({
  videoUrl: z.string().url("Invalid video URL"),
});

export const addSubtopicsSchema = z.object({
  subtopics: z.array(z.string().min(1)),
});
