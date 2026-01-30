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
  updateCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";

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

// ADMIN (UNCHANGED)
router.route("/").post(protect, addCourse);
router.route("/:id").delete(protect, deleteCourse);
router.route("/:id").put(protect,updateCourse);
router.route("/:courseId/modules").post(protect, addModules);
router.route("/:courseId/modules/:moduleId/lessons").post(protect, addLessons);
router
  .route("/:courseId/lessons/:lessonId/video")
  .put(protect, updateLessonVideo);
router.route("/:courseId/subtopics").post(protect, addSubtopics);

export default router;
