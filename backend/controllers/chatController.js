import User from "../models/User.js";
import Preference from "../models/Preference.js";
// import { GoogleGenAI } from "@google/genai";
import { detectIntent } from "../services/intentService.js";
import { buildUserContext } from "../services/contextBuilder.js";
import { askGemini } from "../services/geminiChatService.js";
import { detectNavigation } from "../services/navigationService.js";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });


export const getChatContext = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

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

    res.status(500).json({
      message: "Failed to load context",
    });
  }
};

export const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
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
        reply: `
        Learning Goal: ${preferences.learning_goal}

        Experience Level: ${preferences.experience_level}

        Learning Style: ${preferences.learning_style}

        Weekly Commitment: ${preferences.weekly_commitment}
                `,
      });
    }

    //recommendation
    if(intent.type === "recommendation") {
      const courses = user.purchasedCourses || [];
      if (!courses.length) {
        return res.json({
          reply: "You are not enrolled in any courses yet.",
        });
      }

      const course= courses[0];
      return res.json({
        reply: `I recommend continuing ${course.courseTitle}.`,
      });
    }

    //current lesson
    if(intent.type === "current_lesson"){
      const courses = user.purchasedCourses || [];

      const activeCourse = courses.find(
        (c) => c.progress?.currentLesson
      );

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
        reply: `
          Theme: ${user.settings?.appearance?.theme || "light"}
          Language: ${user.settings?.appearance?.language || "en"}
        `,
      });
    }

    // Progress
    if (intent.type === "progress_info") {
      const courses = user.purchasedCourses || [];

      let completedLessons = 0;
      const courseProgress = [];

      courses.forEach((course) => {
        const completed =
          course.progress?.completedLessons?.length || 0;

        completedLessons += completed;

        courseProgress.push(
          `${course.courseTitle}: ${completed} completed lessons`
        );
      });

      return res.json({
        reply: `Hi ${userName},
        You are enrolled in ${courses.length} course(s).
        Total completed lessons: ${completedLessons}
        ${courseProgress.join("\n")}`
      });
    }

    const detectedRoute = detectNavigation(message);

    if (detectedRoute) {
      return res.json({
        reply: "I can take you there.",
        route: detectedRoute,
      });
    }

    const context = buildUserContext(
      user,
      preferences
    );

    const geminiReply = await askGemini(
      context,
      message
    );

    // Check if Gemini returned a route
    let route = null;

    const routeMatch = geminiReply.match(
      /ROUTE:(.+)/i
    );

    if (routeMatch) {
      route = routeMatch[1].trim();
    }

    // Remove ROUTE from visible message
    const cleanedReply = geminiReply.replace(
      /ROUTE:.*/i,
      ""
    ).trim();

    return res.json({
      reply: cleanedReply,
      route,
    });
    } catch (error) {
      console.error("CHAT ERROR:", error);

      res.status(500).json({
        message: "Failed to process chat",
      });
    }
};