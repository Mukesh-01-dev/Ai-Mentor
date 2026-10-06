import User from "../models/User.js";
import Preference from "../models/Preference.js";
import { detectIntent } from "../services/intentService.js";
import { buildUserContext } from "../services/contextBuilder.js";
import { askGemini } from "../services/geminiChatService.js";
import { detectNavigation } from "../services/navigationService.js";

// Only these routes may be sent to the frontend from Gemini's reply.
// Replace with your real frontend routes.
const ALLOWED_ROUTES = new Set([
  "/settings",
  "/courses",
  "/discussions",
  "/watchedvideos",
]);

const MAX_MESSAGE_LENGTH = 1000;
const GEMINI_TIMEOUT_MS = 20000;

// Rejects with a 504-style error if the promise takes too long.
const withTimeout = (promise, ms) => {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("Gemini request timed out");
      err.status = 504;
      reject(err);
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export const getChatContext = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const preferences = await Preference.findOne({
      where: {
        user_id: user.id,
      },
    });

    return res.json({
      user: {
        name: user.name,
        email: user.email,
      },

      purchasedCourses: user.purchasedCourses || [],

      settings: user.settings || {},

      preferences: preferences || {},
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load context",
    });
  }
};

export const chatWithAssistant = async (req, res) => {
  try {
    const rawMessage = req.body?.message;

    if (typeof rawMessage !== "string" || !rawMessage.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const message = rawMessage.trim();

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
      });
    }

    // Load user and preferences FIRST
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userName = user.firstName || user.name || "Student";

    const preferences = await Preference.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    // Detect intent
    const intent = detectIntent(message);

    // Navigation
    if (intent.type === "navigation") {
      return res.json({
        reply: `You can open ${intent.route}`,
        route: intent.route,
      });
    }

    // Enrolled Courses
    if (intent.type === "course_info") {
      const courses = user.purchasedCourses || [];

      if (!courses.length) {
        return res.json({
          reply: "You are not enrolled in any courses.",
        });
      }

      const list = courses
        .map((course, index) => `${index + 1}. ${course.courseTitle}`)
        .join("\n");

      return res.json({
        reply: `Hi ${userName}, you are currently enrolled in:\n\n${list}`,
      });
    }

    // Preferences
    if (intent.type === "preference_info") {
      if (!preferences) {
        return res.json({
          reply: "No learning preferences found.",
        });
      }

      return res.json({
        reply: [
          `Learning Goal: ${preferences.learning_goal || "Not set"}`,
          `Experience Level: ${preferences.experience_level || "Not set"}`,
          `Learning Style: ${preferences.learning_style || "Not set"}`,
          `Weekly Commitment: ${preferences.weekly_commitment || "Not set"}`,
        ].join("\n\n"),
      });
    }

    // Recommendation
    if (intent.type === "recommendation") {
      const courses = user.purchasedCourses || [];

      if (!courses.length) {
        return res.json({
          reply: "You are not enrolled in any courses yet.",
        });
      }

      const course = courses[0];

      return res.json({
        reply: `I recommend continuing ${course.courseTitle}.`,
      });
    }

    // Current lesson
    if (intent.type === "current_lesson") {
      const courses = user.purchasedCourses || [];

      const activeCourse = courses.find((c) => c.progress?.currentLesson);

      if (!activeCourse) {
        return res.json({
          reply: "I couldn't find an active lesson.",
        });
      }

      return res.json({
        reply: `You were last studying lesson ${activeCourse.progress.currentLesson} in ${activeCourse.courseTitle}.`,
      });
    }

    // Settings
    if (intent.type === "settings_info") {
      return res.json({
        reply: [
          `Theme: ${user.settings?.appearance?.theme || "light"}`,
          `Language: ${user.settings?.appearance?.language || "en"}`,
        ].join("\n"),
      });
    }

    // Progress
    if (intent.type === "progress_info") {
      const courses = user.purchasedCourses || [];

      let completedLessons = 0;
      const courseProgress = [];

      courses.forEach((course) => {
        const completed = course.progress?.completedLessons?.length || 0;

        completedLessons += completed;

        courseProgress.push(
          `${course.courseTitle}: ${completed} completed lessons`
        );
      });

      return res.json({
        reply: [
          `Hi ${userName},`,
          `You are enrolled in ${courses.length} course(s).`,
          `Total completed lessons: ${completedLessons}`,
          ...courseProgress,
        ].join("\n"),
      });
    }

    const detectedRoute = detectNavigation(message);

    if (detectedRoute) {
      return res.json({
        reply: "I can take you there.",
        route: detectedRoute,
      });
    }

    const context = buildUserContext(user, preferences);

    // Call Gemini with its own error handling
    let geminiReply;
    try {
      geminiReply = await withTimeout(
        askGemini(context, message),
        GEMINI_TIMEOUT_MS
      );
    } catch (geminiError) {
      const rawStatus = geminiError?.status ?? geminiError?.code;
      const status = Number(rawStatus); // NaN if it isn't numeric
      const errMsg = geminiError?.message ?? "";

      console.error(
        `GEMINI ERROR [status: ${rawStatus ?? "unknown"}]:`,
        errMsg
      );

      const isRateLimited =
        status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(errMsg);

      if (isRateLimited) {
        return res.json({
          reply:
            "I am receiving too many requests right now. Please wait a moment and ask me again!",
        });
      }

      const isServiceOutage =
        (Number.isFinite(status) && status >= 500) ||
        /UNAVAILABLE|overloaded/i.test(errMsg);

      if (isServiceOutage) {
        return res.json({
          reply:
            "The AI service is temporarily unavailable. Please try again shortly.",
        });
      }

      throw geminiError; // anything else goes to the main catch -> 500
    }

    // Success path: runs only when Gemini responded
    if (typeof geminiReply !== "string" || !geminiReply.trim()) {
      return res.json({
        reply:
          "Sorry, I couldn't come up with a response. Please try rephrasing.",
      });
    }

    // Check if Gemini returned a route (only whitelisted routes are allowed)
    let route = null;
    const routeMatch = geminiReply.match(/^ROUTE:\s*(\S+)\s*$/m);

    if (routeMatch && ALLOWED_ROUTES.has(routeMatch[1])) {
      route = routeMatch[1];
    }

    // Remove ROUTE line from the visible message
    const cleanedReply = geminiReply.replace(/^ROUTE:.*$/m, "").trim();

    return res.json({
      reply: cleanedReply,
      route,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      message: "Failed to process chat",
    });
  }
};