import express from "express";
import {
  getCourseCommunityStats,
  getCourseDiscussions,
  getGlobalDiscussions,
  createCommunityPost,
  editCommunityPost,
  deleteCommunityPost,
  likeCommunityPost,
  dislikeCommunityPost,
  replyCommunityPost,
  getAllCoursePosts,
  reportContent,
  getReports,
  moderateReport,
  unhideContent,
  editReply,
  deleteReply,
} from "../controllers/communityController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================
   REPORTS / MODERATION (must be before /:id routes)
======================= */
router.get("/reports", protect, admin, getReports);
router.put("/reports/:reportId", protect, admin, moderateReport);

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
router.put("/:id", protect, editCommunityPost);
router.delete("/:id", protect, deleteCommunityPost);
router.put("/:id/like", protect, likeCommunityPost);
router.put("/:id/dislike", protect, dislikeCommunityPost);
router.post("/:id/reply", protect, replyCommunityPost);
router.put("/:id/reply/:replyId", protect, editReply);
router.delete("/:id/reply/:replyId", protect, deleteReply);
router.put("/:id/unhide", protect, admin, unhideContent);
router.post("/:id/report", protect, reportContent);

export default router;
