import Discussion from "../models/Discussion.js";
import User from "../models/User.js";

// @desc    Create a new discussion
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const discussion = await Discussion.create({
      userId: req.user.id,
      title,
      description,
      replies: [],
      likes: [],
    });

    const populatedDiscussion = await Discussion.findByPk(discussion.id, {
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    });

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error("CREATE DISCUSSION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all discussions
// @route   GET /api/discussions
// @access  Private
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    // Since replies are JSONB and contain user IDs, we might want to populate them
    // but for simplicity in this conversion, we'll return them as is.
    // In a real migration, you'd either normalize or fetch users separately.

    res.json(discussions);
  } catch (error) {
    console.error("GET DISCUSSIONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const addReplyToDiscussion = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { text } = req.body;
    const discussionId = req.params.id;

    if (!text) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const discussion = await Discussion.findByPk(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const newReply = {
      id: crypto.randomUUID(), // Using standard crypto or uuid
      userId: req.user.id,
      text,
      likes: [],
      createdAt: new Date(),
    };

    const updatedReplies = [...discussion.replies, newReply];
    discussion.replies = updatedReplies;
    await discussion.save();

    const updatedDiscussion = await Discussion.findByPk(discussionId, {
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    });

    res.json(updatedDiscussion);
  } catch (error) {
    console.error("ADD REPLY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like/Unlike discussion
// @route   PUT /api/discussions/:id/like
// @access  Private
const likeDiscussion = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const discussionId = req.params.id;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    let likes = discussion.likes || [];
    const likeIndex = likes.findIndex((like) => like.userId === userId);

    if (likeIndex > -1) {
      likes = likes.filter((like) => like.userId !== userId);
    } else {
      likes.push({ userId });
    }

    discussion.likes = likes;
    await discussion.save();

    const updatedDiscussion = await Discussion.findByPk(discussionId, {
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    });

    res.json(updatedDiscussion);
  } catch (error) {
    console.error("LIKE DISCUSSION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like/Unlike reply
// @route   PUT /api/discussions/:discussionId/reply/:replyId/like
// @access  Private
const likeReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { discussionId, replyId } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findByPk(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const replies = [...discussion.replies];
    const replyIndex = replies.findIndex((r) => r.id === replyId);

    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    let replyLikes = replies[replyIndex].likes || [];
    const likeIndex = replyLikes.findIndex((like) => like.userId === userId);

    if (likeIndex > -1) {
      replyLikes = replyLikes.filter((like) => like.userId !== userId);
    } else {
      replyLikes.push({ userId });
    }

    replies[replyIndex].likes = replyLikes;
    discussion.replies = replies;
    await discussion.save();

    const updatedDiscussion = await Discussion.findByPk(discussionId, {
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    });

    res.json(updatedDiscussion);
  } catch (error) {
    console.error("LIKE REPLY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createDiscussion,
  getDiscussions,
  addReplyToDiscussion,
  likeDiscussion,
  likeReply,
};
