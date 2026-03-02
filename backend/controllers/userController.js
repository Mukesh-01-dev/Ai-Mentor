// backend/controller/userController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

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
      purchasedCourses: user.purchasedCourses,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url, // 🔥 ADD THIS
      purchasedCourses: user.purchasedCourses,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
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
      avatar_url: user.avatar_url,  // 👈 ADD THIS LINE
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Purchase course
const purchaseCourse = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { courseId, courseTitle } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyPurchased = user.purchasedCourses.some(
      (c) => c.courseId == courseId
    );

    if (alreadyPurchased) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    const updatedCourses = [
      ...user.purchasedCourses,
      {
        courseId: Number(courseId),
        courseTitle,
        purchaseDate: new Date(),
        progress: { completedLessons: [], currentLesson: null },
      },
    ];

    user.purchasedCourses = updatedCourses;
    await user.save();

    res.json({ message: "Course purchased successfully" });
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

    user.analytics = user.analytics || {
      totalHours: 0,
      daysStudied: 0,
      completedCourses: 0,
      certificates: 0,
      studySessions: [],
      learningHoursChart: [],
    };

    await user.save();
    res.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("PROGRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// STUB FUNCTIONS (to prevent module crashes)
const getWatchedVideos = async (req, res) => {
  res.status(501).json({ message: "getWatchedVideos not implemented yet" });
};

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only settings JSON
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
  console.log("REQ.FILE:", req.file);
  console.log("REQ.BODY:", req.body);

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
      user.avatar = `/uploads/${req.file.filename}`;

      // delete temp file
      fs.unlinkSync(req.file.path);
    }

    // Update text fields
    user.firstName = req.body.firstName ?? user.firstName;
    user.lastName = req.body.lastName ?? user.lastName;
    user.name = `${user.firstName} ${user.lastName}`.trim();
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
      avatar_url: user.avatar_url,  // 👈 added
      purchasedCourses: user.purchasedCourses,
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ❗ DEV / ADMIN ONLY
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

// EXPORTS
export {
  registerUser,
  loginUser,
  getUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getUserSettings,
  getWatchedVideos, // stub
  updateUserSettings, // stub
  updateUserProfile, // stub
  removePurchasedCourse,
};
