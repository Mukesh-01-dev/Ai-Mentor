import express from "express";
import {
  getCourseCommunityStats,
  getCourseDiscussions,
  getGlobalDiscussions,
  createCommunityPost,
  likeCommunityPost,
  dislikeCommunityPost,
  replyCommunityPost,
  getAllCoursePosts,
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================
   COURSE COMMUNITY
======================= */
// List courses with post counts
router.get("/courses", protect, getCourseCommunityStats);

// Get all course-type posts (for the 2-column grid)
router.get("/course-posts", protect, getAllCoursePosts);

// Get posts for a specific course
router.get("/course/:courseId", protect, getCourseDiscussions);

/* =======================
   GLOBAL COMMUNITY
======================= */
router.get("/global", protect, getGlobalDiscussions);

/* =======================
   CRUD
======================= */
router.post("/", protect, createCommunityPost);
router.put("/:id/like", protect, likeCommunityPost);
router.put("/:id/dislike", protect, dislikeCommunityPost);
router.post("/:id/reply", protect, replyCommunityPost);

export default router;
