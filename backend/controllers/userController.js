// backend/controller/userController.js
import User from "../models/User.js";
import CommunityPost from "../models/CommunityPost.js";
import Notifications from "../models/Notification.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { ensureProfileCompleteness, formatFullName } from "../utils/userUtils.js";

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Register user
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const name = `${firstName} ${lastName}`.trim();

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      name,
      email,
      password,
    });

    res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
      purchasedCourses: user.purchasedCourses,
      isNewUser: true,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Centralized logic moved to userUtils.js

// @desc Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Run completeness check on every login
    await ensureProfileCompleteness(user);

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
      isGoogleUser: !!user.googleId,
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
      isNewUser: false,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Password is not set for this account" });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.password = newPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get profile
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
      isGoogleUser: !!user.googleId,
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Purchase course / Enroll free course
const purchaseCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { courseId, courseTitle } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const purchasedCourses = user.purchasedCourses || [];

    // Prevent duplicate enrollment
    const alreadyPurchased = purchasedCourses.some(
      (c) => Number(c.courseId) === Number(courseId)
    );

    if (alreadyPurchased) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Add course
    purchasedCourses.push({
      courseId: Number(courseId),
      courseTitle: courseTitle || "Course",
      purchaseDate: new Date(),
      progress: {
        completedLessons: [],
        currentLesson: null,
      },
    });

    user.purchasedCourses = purchasedCourses;

    // Important for Sequelize JSON/JSONB update
    user.changed("purchasedCourses", true);

    await user.save();

    res.status(200).json({
      message: "Course enrolled successfully",
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("PURCHASE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update progress
const updateCourseProgress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { courseId, lessonData, currentLesson, completedLesson } = req.body;

    let courses = [...(user.purchasedCourses || [])];
    let courseIndex = courses.findIndex(
      (c) => Number(c.courseId) === Number(courseId)
    );

    if (courseIndex !== -1) {
      let progress = courses[courseIndex].progress || {
        completedLessons: [],
        currentLesson: null,
        lessonData: {},
      };

      if (!progress.lessonData) progress.lessonData = {};

      if (lessonData && lessonData.lessonId) {
        progress.lessonData[lessonData.lessonId] = {
          ...progress.lessonData[lessonData.lessonId],
          ...lessonData.data,
        };
      }

      if (currentLesson) {
        progress.currentLesson = currentLesson;
      }

      if (
        completedLesson &&
        !progress.completedLessons.some(
          (l) => l.lessonId === completedLesson.lessonId
        )
      ) {
        progress.completedLessons.push(completedLesson);
      }

      courses[courseIndex].progress = progress;
      user.set("purchasedCourses", courses);

      user.changed("purchasedCourses", true);
      console.log(
        "Saved lesson data for course:",
        courseId,
        "lesson:",
        lessonData?.lessonId
      );
    }

    user.analytics = user.analytics || {
      totalHours: 0,
      daysStudied: 0,
      completedCourses: 0,
      certificates: 0,
      studySessions: [],
      learningHoursChart: [],
    };

    await user.save();
    res.json({
      message: "Progress updated successfully",
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("PROGRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getWatchedVideos = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = user.purchasedCourses || [];
    console.log("getWatchedVideos - courses loaded:", JSON.stringify(courses, null, 2));

    let videoData = [];
    let totalSeconds = 0;
    let completedCount = 0;
    const uniqueCourses = [];

    courses.forEach((course) => {
      if (course.courseTitle) {
        uniqueCourses.push({ id: course.courseId, title: course.courseTitle });
      }

      const lessonData = course.progress?.lessonData || {};
      Object.keys(lessonData).forEach((lessonId) => {
        const watchHistory = lessonData[lessonId]?.watchHistory;
        if (watchHistory) {
          const safeProgress = Math.max(
            0,
            Math.min(100, Math.round(watchHistory.progressPercent || 0))
          );

          const rawDuration = watchHistory.formattedDuration;
          const displayDuration =
            rawDuration === "NaN:NaN" || !rawDuration ? "--:--" : rawDuration;

          videoData.push({
            id: `${course.courseId}-${lessonId}`,
            lessonId: lessonId,
            courseId: course.courseId,
            course: course.courseTitle || `Course ${course.courseId}`,
            title: watchHistory.title || `Lesson ${lessonId}`,
            thumbnail:
              watchHistory.thumbnail ||
              "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
            duration: displayDuration,
            progress: safeProgress,
            status: watchHistory.status || "in-progress",
            lastWatched: watchHistory.lastWatched || new Date().toISOString(),
            currentTime: watchHistory.currentTime || 0,
          });

          if (watchHistory.currentTime > 0) {
            totalSeconds += watchHistory.currentTime;
          }
          if (watchHistory.status === "completed" || safeProgress >= 95) {
            completedCount++;
          }
        }
      });
    });

    const metrics = {
      totalHours: (totalSeconds / 3600).toFixed(1),
      videosCompleted: completedCount,
      avgSession: "15min",
      learningStreak: "3 days",
    };

    res.json({ videos: videoData, metrics, courses: uniqueCourses });
  } catch (error) {
    console.error("Failed to fetch watched videos:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { notifications, security, appearance } = req.body;

    user.settings = {
      ...user.settings,
      notifications: notifications
        ? { ...user.settings.notifications, ...notifications }
        : user.settings.notifications,
      security: security
        ? { ...user.settings.security, ...security }
        : user.settings.security,
      appearance: appearance
        ? { ...user.settings.appearance, ...appearance }
        : user.settings.appearance,
    };

    await user.save();

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Avatar Upload Handling
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_avatars",
        public_id: `user_${user.id}`,
        overwrite: true,
      });

      user.avatar_url = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    // Update text fields
    user.firstName = req.body.firstName ?? user.firstName;
    user.lastName = req.body.lastName ?? user.lastName;
    user.name = formatFullName(user.firstName, user.lastName);
    user.email = req.body.email ?? user.email;
    user.bio = req.body.bio ?? user.bio;

    await user.save();

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
      isGoogleUser: !!user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DEV / ADMIN ONLY
const removePurchasedCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.purchasedCourses = user.purchasedCourses.filter(
      (c) => Number(c.courseId) !== Number(courseId)
    );

    await user.save();

    res.json({ message: "Course removed successfully" });
  } catch (error) {
    console.error("REMOVE COURSE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User Account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const avatarPublicId = `user_avatars/user_${userId}`;
      await cloudinary.uploader.destroy(avatarPublicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary avatar deletion error:", cloudinaryError);
    }

    await CommunityPost.destroy({
      where: { userId },
    });

    await Notifications.destroy({
      where: { userId },
    });

    await User.destroy({
      where: { id: userId },
    });

    res.status(200).json({
      message: "Account Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete Account Error", error);
    res.status(500).json({message: "Failed to delete account"}); 
  } 
}
// Complete first-time user profile onboarding
// Google users: firstName, lastName, password (required), bio, avatar
// Email users: bio, avatar
const completeProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent re-completion for already completed profiles
    if (user.isProfileComplete) {
      // Return gracefully instead of erroring, letting the frontend handle redirection
      return res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar_url: user.avatar_url,
        isProfileComplete: user.isProfileComplete,
        purchasedCourses: user.purchasedCourses,
      });
    }

    const { firstName, lastName, password, bio } = req.body;

    // Apply missing fields if provided
    if (firstName && firstName.trim() !== '') {
      user.firstName = firstName;
    }
    if (lastName && lastName.trim() !== '') {
      user.lastName = lastName;
    }
    if (user.firstName || user.lastName) {
      user.name = formatFullName(user.firstName, user.lastName);
    }
    if (password && password.length >= 6 && !!user.googleId) {
      user.password = password; // strictly handled by beforeSave hook!
    }

    // All users: bio (required if not already set)
    if (bio && bio.trim().length > 0) {
      user.bio = bio;
    } else if (!user.bio || user.bio.trim().length === 0) {
      return res.status(400).json({ message: "Bio is required" });
    }

    // Avatar upload via Cloudinary (required if not already set)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_avatars",
        public_id: `user_${user.id}`,
        overwrite: true,
      });
      user.avatar_url = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (!user.avatar_url) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    user.isProfileComplete = true; // Temporary flag to trigger save check
    await user.save();

    // Final safety check: if the hook found it's STILL incomplete, return a list of missing fields.
    if (!user.isProfileComplete) {
      const missingFields = [];
      if (!user.firstName) missingFields.push("First Name");
      if (!user.lastName) missingFields.push("Last Name");
      if (!user.bio) missingFields.push("Bio");
      if (!user.avatar_url) missingFields.push("Profile Photo");
      if (user.googleId && !user.password) missingFields.push("Password");

      return res.status(400).json({ 
        message: `Profile is still incomplete. Missing: ${missingFields.join(", ")}`,
        missingFields 
      });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
      isGoogleUser: !!user.googleId,
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("COMPLETE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORTS
export {
  registerUser,
  loginUser,
  getUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getUserSettings,
  getWatchedVideos,
  updateUserSettings,
  updateUserProfile,
  removePurchasedCourse,
  deleteAccount,
  changePassword,
  completeProfile,
};
