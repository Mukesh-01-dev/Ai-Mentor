import CommunityPost from "../models/CommunityPost.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import crypto from "crypto";
import { createNotification } from "./notificationController.js";

// @desc    Get course community stats (list of courses with post counts)
// @route   GET /api/community/courses
// @access  Private
const getCourseCommunityStats = async (_req, res) => {
  try {
    const posts = await CommunityPost.findAll({
      where: { type: "course" },
      attributes: ["courseId", "courseName"],
    });

    // Aggregate by courseId
    const courseMap = {};
    posts.forEach((p) => {
      const key = p.courseId;
      if (!courseMap[key]) {
        courseMap[key] = { courseId: p.courseId, courseName: p.courseName, postCount: 0 };
      }
      courseMap[key].postCount++;
    });

    res.json(Object.values(courseMap));
  } catch (error) {
    console.error("GET COURSE COMMUNITY STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get discussions for a specific course community
// @route   GET /api/community/course/:courseId
// @access  Private
const getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sort } = req.query;

    const posts = await CommunityPost.findAll({
      where: { type: "course", courseId: parseInt(courseId) },
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Sort in JS to avoid sequelize literal issues
    if (sort === "popular") {
      posts.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    }

    res.json(posts);
  } catch (error) {
    console.error("GET COURSE DISCUSSIONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get global discussions
// @route   GET /api/community/global
// @access  Private
const getGlobalDiscussions = async (req, res) => {
  try {
    const { category, sort } = req.query;

    const where = { type: "global" };
    if (category && category !== "All Categories") {
      where.category = category;
    }

    const posts = await CommunityPost.findAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (sort === "popular") {
      posts.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    }

    res.json(posts);
  } catch (error) {
    console.error("GET GLOBAL DISCUSSIONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a community post (course or global)
// @route   POST /api/community
// @access  Private
const createCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { type, courseId, courseName, category, content } = req.body;

    if (!type || !content) {
      return res
        .status(400)
        .json({ message: "Type and content are required" });
    }

    if (type === "course" && (!courseId || !courseName)) {
      return res
        .status(400)
        .json({ message: "courseId and courseName are required for course posts" });
    }

    if (type === "global" && !category) {
      return res
        .status(400)
        .json({ message: "Category is required for global posts" });
    }

    const post = await CommunityPost.create({
      userId: req.user.id,
      type,
      courseId: type === "course" ? courseId : null,
      courseName: type === "course" ? courseName : null,
      category: type === "global" ? category : null,
      content,
      likes: [],
      dislikes: [],
      replies: [],
    });

    const populated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("CREATE COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Edit a community post
// @route   PUT /api/community/:id
// @access  Private
const editCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    post.content = content.trim();
    await post.save();

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("EDIT COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a community post
// @route   DELETE /api/community/:id
// @access  Private
const deleteCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Remove related report rows first to satisfy Reports.postId FK constraint.
    await Report.destroy({ where: { postId: post.id } });
    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like / unlike a community post
// @route   PUT /api/community/:id/like
// @access  Private
const likeCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    let likes = [...(post.likes || [])];
    const idx = likes.findIndex((l) => l.userId === userId);

    if (idx > -1) {
      likes = likes.filter((l) => l.userId !== userId);
    } else {
      likes = [...likes, { userId }];
      // Remove from dislikes if present
      post.dislikes = (post.dislikes || []).filter((d) => d.userId !== userId);
      post.changed("dislikes", true);
    }

    post.likes = likes;
    post.changed("likes", true);
    await post.save();

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("LIKE COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Dislike / un-dislike a community post
// @route   PUT /api/community/:id/dislike
// @access  Private
const dislikeCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    let dislikes = [...(post.dislikes || [])];
    const idx = dislikes.findIndex((d) => d.userId === userId);

    if (idx > -1) {
      dislikes = dislikes.filter((d) => d.userId !== userId);
    } else {
      dislikes = [...dislikes, { userId }];
      // Remove from likes if present
      post.likes = (post.likes || []).filter((l) => l.userId !== userId);
      post.changed("likes", true);
    }

    post.dislikes = dislikes;
    post.changed("dislikes", true);
    await post.save();

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("DISLIKE COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reply to a community post
// @route   POST /api/community/:id/reply
// @access  Private
const replyCommunityPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newReply = {
      id: crypto.randomUUID(),
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar_url || null,
      text,
      likes: [],
      dislikes: [],
      createdAt: new Date(),
    };

    const updatedReplies = [...(post.replies || []), newReply];
    post.replies = updatedReplies;
    post.changed("replies", true);
    await post.save();

    // Notification Trigger (Discussion Reply)
    // Send notification to the post author (unless they are replying to their own post)
    if (post.userId !== req.user.id) {
      createNotification(post.userId, {
        title: "New Reply on your post",
        message: `${req.user.name} replied: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        type: "social",
      });
    }

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("REPLY COMMUNITY POST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all course-type posts for the listing view (recent discussions across all courses)
// @route   GET /api/community/course-posts
// @access  Private
const getAllCoursePosts = async (req, res) => {
  try {
    const { sort } = req.query;

    const posts = await CommunityPost.findAll({
      where: { type: "course" },
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (sort === "popular") {
      posts.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    }

    res.json(posts);
  } catch (error) {
    console.error("GET ALL COURSE POSTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Report a post or reply
// @route   POST /api/community/:id/report
// @access  Private
const reportContent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { replyId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Prevent users from reporting their own content
    if (replyId) {
      const reply = (post.replies || []).find((r) => String(r.id) === String(replyId));
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      // Check if user is trying to report their own reply
      if (reply.userId === req.user.id) {
        return res.status(403).json({ message: "You cannot report your own reply" });
      }
    } else {
      // Check if user is trying to report their own post
      if (post.userId === req.user.id) {
        return res.status(403).json({ message: "You cannot report your own post" });
      }
    }

    // Check for duplicate report
    const existing = await Report.findOne({
      where: {
        reporterId: req.user.id,
        postId: req.params.id,
        replyId: replyId || null,
      },
    });

    if (existing) {
      return res.status(409).json({ message: "You have already reported this content" });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      postId: req.params.id,
      replyId: replyId || null,
      reason,
      description: description || null,
    });

    // Notify all admin users with a clear moderation message
    const admins = await User.findAll({ where: { role: "admin" } });
    const reporterName = req.user?.name || "A user";
    const isCommentReport = Boolean(replyId);
    const contentLabel = isCommentReport ? "comment" : "discussion post";
    const normalizedReason = typeof reason === "string" ? reason.replace(/[_-]+/g, " ").trim() : "";
    const hasCategoryReason = normalizedReason && normalizedReason.toLowerCase() !== "other";
    const reasonOrDescription = description?.trim()
      ? `Reason: "${description.trim().slice(0, 140)}${description.trim().length > 140 ? "..." : ""}"`
      : `Category: ${hasCategoryReason ? normalizedReason : "other"}`;

    for (const admin of admins) {
      await createNotification(admin.id, {
        title: isCommentReport ? "Comment Reported" : "Discussion Post Reported",
        message: `${reporterName} reported a ${contentLabel}. ${reasonOrDescription}`,
        type: "security",
        metadata: {
          reportId: report.id,
          postId: req.params.id,
          replyId,
          contentType: contentLabel,
          postType: post.type || null,
          courseId: post.courseId || null,
          courseName: post.courseName || null,
        },
      });
    }

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("REPORT CONTENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all pending reports (admin only)
// @route   GET /api/community/reports
// @access  Private/Admin
const getReports = async (_req, res) => {
  try {
    const reports = await Report.findAll({
      where: { status: "pending" },
      include: [
        { model: User, as: "reporter", attributes: ["id", "name", "email"] },
        {
          model: CommunityPost,
          as: "post",
          attributes: ["id", "content", "replies", "userId"],
          include: [
            { model: User, as: "author", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reports);
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Moderate a report (hide, delete, or dismiss)
// @route   PUT /api/community/reports/:reportId
// @access  Private/Admin
const moderateReport = async (req, res) => {
  try {
    const { action } = req.body;

    if (!["hidden", "deleted", "dismissed"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use: hidden, deleted, or dismissed" });
    }

    const report = await Report.findByPk(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.status === "resolved") {
      return res.status(400).json({ message: "Report already resolved" });
    }

    const post = await CommunityPost.findByPk(report.postId);

    const resolveWhere = report.replyId
      ? { postId: report.postId, replyId: report.replyId, status: "pending" }
      : action === "deleted"
        ? { postId: report.postId, status: "pending" }
        : { postId: report.postId, replyId: null, status: "pending" };

    if (action === "hidden") {
      if (post) {
        if (report.replyId) {
          // Hide the specific reply once; all pending reports for this reply are resolved together.
          const replies = (post.replies || []).map((r) =>
            String(r.id) === String(report.replyId) ? { ...r, hidden: true } : r
          );
          post.replies = replies;
          post.changed("replies", true);
          await post.save();
        } else {
          // Hide the post once; all pending reports for this post are resolved together.
          post.hiddenAt = new Date().toISOString();
          post.changed("hiddenAt", true);
          await post.save();
        }
      }
    }
    // For "dismissed", no content change is required.

    const reportsToResolve = await Report.findAll({ where: resolveWhere });
    const resolvedReportIds = reportsToResolve.map((r) => r.id);
    const reporterIds = [...new Set(reportsToResolve.map((r) => r.reporterId))];

    if (resolvedReportIds.length > 0) {
      await Report.update(
        { status: "resolved", action },
        { where: { id: resolvedReportIds } }
      );
    }

    if (action === "deleted") {
      if (post) {
        if (report.replyId) {
          // Delete the specific reply once; all pending reports for this reply are resolved together.
          const replies = (post.replies || []).filter((r) => String(r.id) !== String(report.replyId));
          post.replies = replies;
          post.changed("replies", true);
          await post.save();
        } else {
          // Delete report rows first to satisfy Reports.postId FK, then delete post.
          await Report.destroy({ where: { postId: report.postId } });
          await post.destroy();
        }
      }
    }

    const actionMessages = {
      hidden: "The content you reported has been hidden by a moderator.",
      deleted: "The content you reported has been deleted by a moderator.",
      dismissed: "Your report has been reviewed and dismissed by a moderator.",
    };

    await Promise.all(
      reporterIds.map((reporterId) =>
        createNotification(reporterId, {
          title: "Report Resolved",
          message: actionMessages[action],
          type: "system",
        })
      )
    );

    res.json({
      message: `Report ${action} successfully`,
      resolvedReportsCount: resolvedReportIds.length,
      resolvedReporterCount: reporterIds.length,
    });
  } catch (error) {
    console.error("MODERATE REPORT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Edit a reply
// @route   PUT /api/community/:id/reply/:replyId
// @access  Private
const editReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const replies = [...(post.replies || [])];
    const replyIndex = replies.findIndex((r) => r.id === req.params.replyId);

    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if user owns the reply
    if (replies[replyIndex].userId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own replies" });
    }

    // Update the reply
    replies[replyIndex] = {
      ...replies[replyIndex],
      text,
      edited: true,
      editedAt: new Date(),
    };

    post.replies = replies;
    post.changed("replies", true);
    await post.save();

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("EDIT REPLY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/community/:id/reply/:replyId
// @access  Private
const deleteReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const replies = [...(post.replies || [])];
    const replyIndex = replies.findIndex((r) => r.id === req.params.replyId);

    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if user owns the reply
    if (replies[replyIndex].userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own replies" });
    }

    // Remove the reply
    replies.splice(replyIndex, 1);

    post.replies = replies;
    post.changed("replies", true);
    await post.save();

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    console.error("DELETE REPLY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unhide a post or reply (admin only)
// @route   PUT /api/community/:id/unhide
// @access  Private/Admin
const unhideContent = async (req, res) => {
  try {
    const { replyId } = req.body || {};

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (replyId) {
      const replies = [...(post.replies || [])];
      const replyIndex = replies.findIndex((r) => String(r.id) === String(replyId));

      if (replyIndex === -1) {
        return res.status(404).json({ message: "Reply not found" });
      }

      replies[replyIndex] = {
        ...replies[replyIndex],
        hidden: false,
      };

      post.replies = replies;
      post.changed("replies", true);
      await post.save();
    } else {
      post.hiddenAt = null;
      post.changed("hiddenAt", true);
      await post.save();
    }

    const updated = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: "author", attributes: ["id", "name", "email", "avatar_url"] },
      ],
    });

    res.json({
      message: replyId ? "Reply unhidden successfully" : "Post unhidden successfully",
      post: updated,
    });
  } catch (error) {
    console.error("UNHIDE CONTENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
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
};

