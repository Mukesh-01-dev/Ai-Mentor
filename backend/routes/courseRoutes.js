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
router.route("/").post(protect, admin, addCourse);
router.route("/:id").delete(protect, admin, deleteCourse);
router.route("/:courseId/modules").post(protect, admin, addModules);
router.route("/:courseId/modules/:moduleId/lessons").post(protect, admin, addLessons);
router
  .route("/:courseId/lessons/:lessonId/video")
  .put(protect, admin, updateLessonVideo);
router.route("/:courseId/subtopics").post(protect, admin, addSubtopics);

export default router;
