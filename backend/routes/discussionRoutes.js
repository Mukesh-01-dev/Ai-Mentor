// Replaced by communityRoutes.js, can delete this file but keeping for reference


// import express from "express";
// import {
//   createDiscussion,
//   getDiscussions,
//   addReplyToDiscussion,
//   likeDiscussion,
//   likeReply,
// } from "../controllers/discussionController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* =======================
//    BASE DISCUSSIONS
// ======================= */
// router.route("/").get(protect, getDiscussions).post(protect, createDiscussion);

// /* =======================
//    REPLY LIKE (MOST SPECIFIC)
// ======================= */
// router.route("/:discussionId/reply/:replyId/like").put(protect, likeReply);

// /* =======================
//    DISCUSSION REPLIES
// ======================= */
// router.route("/:id/reply").post(protect, addReplyToDiscussion);

// /* =======================
//    DISCUSSION LIKE
// ======================= */
// router.route("/:id/like").put(protect, likeDiscussion);

// export default router;
