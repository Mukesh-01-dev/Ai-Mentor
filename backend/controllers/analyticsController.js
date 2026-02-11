import User from "../models/User.js";

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure analytics exists
    const analytics = user.analytics || {};

    res.json({
      attendance: analytics.attendance || 0,
      avgMarks: analytics.avgMarks || 0,
      dailyHours: analytics.dailyHours || [],
      totalCourses: analytics.totalCourses || 0,
      completedCourses: analytics.completedCourses || 0,
      totalHours: analytics.totalHours || 0,
      daysStudied: analytics.daysStudied || 0,
      studySessions: analytics.studySessions || [],
      learningHoursChart: analytics.learningHoursChart || [],
      certificates: analytics.certificates || [],
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Record study session
// @route   POST /api/analytics/study-session
// @access  Private
const recordStudySession = async (req, res) => {
  try {
    const { hours, date } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure analytics object exists
    const analytics = user.analytics || {
      totalHours: 0,
      daysStudied: 0,
      studySessions: [],
      lastStudyDate: null,
    };

    const sessionDate = date ? new Date(date) : new Date();

    const isNewDay =
      !analytics.lastStudyDate ||
      new Date(analytics.lastStudyDate).toDateString() !==
        sessionDate.toDateString();

    if (isNewDay) {
      analytics.daysStudied += 1;
      analytics.lastStudyDate = sessionDate;
    }

    analytics.totalHours += hours;

    analytics.studySessions.push({
      date: sessionDate,
      hours: hours,
    });

    user.analytics = analytics;
    // For JSONB, we need to tell Sequelize that the object has changed
    user.changed("analytics", true);
    await user.save();

    res.json({
      message: "Study session recorded successfully",
      analytics: user.analytics,
    });
  } catch (error) {
    console.error("STUDY SESSION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUserAnalytics, recordStudySession };
