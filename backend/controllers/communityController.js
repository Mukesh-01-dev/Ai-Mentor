import CommunityPost from "../models/CommunityPost.js";
import User from "../models/User.js";
import crypto from "crypto";
import { createNotification } from "./notificationController.js";

// @desc    Get course community stats (list of courses with post counts)
// @route   GET /api/community/courses
// @access  Private
const getCourseCommunityStats = async (req, res) => {
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("CREATE COMMUNITY POST ERROR:", error);
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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
      text,
      likes: [],
      dislikes: [],
      createdAt: new Date(),
    };

    const updatedReplies = [...(post.replies || []), newReply];
    post.replies = updatedReplies;
    post.changed("replies", true);
    await post.save();

    // ✅ Notification Trigger (Discussion Reply)
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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
        { model: User, as: "author", attributes: ["id", "name", "email"] },
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

export {
  getCourseCommunityStats,
  getCourseDiscussions,
  getGlobalDiscussions,
  createCommunityPost,
  likeCommunityPost,
  dislikeCommunityPost,
  replyCommunityPost,
  getAllCoursePosts,
};
