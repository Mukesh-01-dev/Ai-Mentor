import express from "express";
import {
  getCourses,
  getCourseById,
  getCourseLearningData,
  getStatsCards,
  getMyCourses,
  addCourse,
  deleteCourse,
  updateLessonVideo,
  addSubtopics,
  addLessons,
  addModules,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  addCourseSchema,
  addModulesSchema,
  addLessonsSchema,
  updateLessonVideoSchema,
  addSubtopicsSchema,
} from "../schemas/courseSchema.js";

const router = express.Router();

/* =======================
   FIXED ORDER (IMPORTANT)
======================= */

// PUBLIC
router.route("/").get(getCourses);

// PROTECTED (KEEP BEFORE :id)
router.route("/my-courses").get(protect, getMyCourses);
router.route("/stats/cards").get(protect, getStatsCards);

// COURSE LEARNING
router.route("/:id/learning").get(getCourseLearningData);

// DYNAMIC (ALWAYS LAST)
router.route("/:id").get(getCourseById);

// ADMIN (PROTECTED + ADMIN ONLY)
router.route("/").post(protect, admin, validate(addCourseSchema), addCourse);
router.route("/:id").delete(protect, admin, deleteCourse);
router.route("/:courseId/modules").post(protect, admin, validate(addModulesSchema), addModules);
router.route("/:courseId/modules/:moduleId/lessons").post(protect, admin, validate(addLessonsSchema), addLessons);
router
  .route("/:courseId/lessons/:lessonId/video")
  .put(protect, admin, validate(updateLessonVideoSchema), updateLessonVideo);
router.route("/:courseId/subtopics").post(protect, admin, validate(addSubtopicsSchema), addSubtopics);

export default router;
