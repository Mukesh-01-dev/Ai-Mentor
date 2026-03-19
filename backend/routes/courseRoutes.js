import express from "express";
import {
  getCourses,
  getCourseById,
  getCourseModules,
  getModuleLessons,
  getLessonDetails,
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

const router = express.Router();

/* =======================
   FIXED ORDER (IMPORTANT)
======================= */

// PUBLIC - List all courses (optimized)
router.route("/").get(getCourses);

// PROTECTED - User-specific routes
router.route("/my-courses").get(protect, getMyCourses);
router.route("/stats/cards").get(protect, getStatsCards);

// NEW: Course modules (lazy load - optimized)
router.route("/:id/modules").get(getCourseModules);

// NEW: Module lessons (lazy load - optimized)
router.route("/:id/modules/:moduleId/lessons").get(getModuleLessons);

// NEW: Lesson details (lazy load - optimized)
router.route("/:id/modules/:moduleId/lessons/:lessonId").get(getLessonDetails);

// LEGACY: Full course learning data (keeps backward compatibility)
router.route("/:id/learning").get(getCourseLearningData);

// Dynamic course details (with modules list)
router.route("/:id").get(getCourseById);

/* =======================
   ADMIN ROUTES
======================= */

// Create course
router.route("/").post(protect, addCourse);

// Delete course
router.route("/:id").delete(protect, deleteCourse);

// Add modules to course
router.route("/:courseId/modules").post(protect, addModules);

// Add lessons to module
router.route("/:courseId/modules/:moduleId/lessons").post(protect, addLessons);

// Update lesson video
router
  .route("/:courseId/lessons/:lessonId/video")
  .put(protect, updateLessonVideo);

// Add subtopics
router.route("/:courseId/subtopics").post(protect, addSubtopics);

export default router;
