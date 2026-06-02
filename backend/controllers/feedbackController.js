import CourseFeedback from "../models/CourseFeedback.js";
import Course from "../models/Course.js";
import { sequelize } from "../config/db.js";

/* ===========================
   SUBMIT / UPDATE FEEDBACK
=========================== */
export const submitFeedback = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Only enrolled users can leave feedback
    const purchasedCourses = req.user.purchasedCourses || [];
    const isEnrolled = purchasedCourses.some(
      (c) => String(c.courseId) === String(courseId)
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: "You must be enrolled to leave a review." });
    }

    // Upsert: one review per user per course
    const [feedback, created] = await CourseFeedback.findOrCreate({
      where: { courseId, userId },
      defaults: {
        courseId,
        userId,
        rating,
        review: review?.trim() || "",
        userName: req.user.name || req.user.firstName || "Student",
        userAvatar: req.user.avatar_url || null,
      },
    });

    if (!created) {
      await feedback.update({
        rating,
        review: review?.trim() || "",
        userName: req.user.name || req.user.firstName || "Student",
        userAvatar: req.user.avatar_url || null,
      });
    }

    // Recompute average rating for the course
    const result = await CourseFeedback.findAll({
      where: { courseId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      raw: true,
    });

    const avgRating = parseFloat(result[0]?.avgRating || 0).toFixed(1);
    const totalReviews = parseInt(result[0]?.totalReviews || 0, 10);

    await Course.update(
      { rating: parseFloat(avgRating) },
      { where: { id: courseId } }
    );

    return res.status(created ? 201 : 200).json({
      message: created ? "Review submitted!" : "Review updated!",
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
        review: feedback.review,
        userName: feedback.userName,
        userAvatar: feedback.userAvatar,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      },
      avgRating,
      totalReviews,
    });
  } catch (error) {
    console.error("SUBMIT FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

/* ===========================
   GET FEEDBACK FOR A COURSE
=========================== */
export const getCourseFeedback = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);

    const feedbacks = await CourseFeedback.findAll({
      where: { courseId },
      order: [["createdAt", "DESC"]],
    });

    const result = await CourseFeedback.findAll({
      where: { courseId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      raw: true,
    });

    // Rating breakdown: how many 1–5 star reviews
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      breakdown[f.rating] = (breakdown[f.rating] || 0) + 1;
    });

    return res.json({
      avgRating: parseFloat(result[0]?.avgRating || 0).toFixed(1),
      totalReviews: parseInt(result[0]?.totalReviews || 0, 10),
      breakdown,
      reviews: feedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        review: f.review,
        userName: f.userName,
        userAvatar: f.userAvatar,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

/* ===========================
   GET CURRENT USER'S FEEDBACK
=========================== */
export const getMyFeedback = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const userId = req.user.id;

    const feedback = await CourseFeedback.findOne({ where: { courseId, userId } });

    if (!feedback) {
      return res.json({ exists: false });
    }

    return res.json({
      exists: true,
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
        review: feedback.review,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("GET MY FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to load your review" });
  }
};

/* ===========================
   DELETE FEEDBACK
=========================== */
export const deleteFeedback = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const userId = req.user.id;

    const feedback = await CourseFeedback.findOne({ where: { courseId, userId } });
    if (!feedback) {
      return res.status(404).json({ message: "Review not found" });
    }

    await feedback.destroy();

    // Recompute average after deletion
    const result = await CourseFeedback.findAll({
      where: { courseId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      raw: true,
    });

    const avgRating = parseFloat(result[0]?.avgRating || 0).toFixed(1);
    await Course.update(
      { rating: parseFloat(avgRating) || null },
      { where: { id: courseId } }
    );

    return res.json({ message: "Review deleted", avgRating, totalReviews: parseInt(result[0]?.totalReviews || 0, 10) });
  } catch (error) {
    console.error("DELETE FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
