import User from "../models/User.js";
import jwt from "jsonwebtoken";

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

    const userExists = await User.findOne({ email });
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
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      purchasedCourses: user.purchasedCourses,
      token: generateToken(user._id),
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

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      purchasedCourses: user.purchasedCourses,
      token: generateToken(user._id),
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

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
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
    const { courseId, courseTitle, courseImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent duplicate purchase
    const alreadyPurchased = user.purchasedCourses.some((c) => Number(c.courseId) === courseId);

    if (alreadyPurchased) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Add course
    user.purchasedCourses.push({
      courseId,
      courseTitle,
      courseImage,
      progress: {
        completedLessons: [],
        currentLesson: [],
      },
    });

    // Update analytics
    user.analytics.totalCourses = user.purchasedCourses.length;

    await user.save();

    res.status(201).json({
      message: "Course purchased successfully",
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.error("PURCHASE COURSE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Update progress
const updateCourseProgress = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.analytics ||= {
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

// ====================
// STUB FUNCTIONS (to prevent module crashes)
// ====================
const getWatchedVideos = async (req, res) => {
  res.status(501).json({ message: "getWatchedVideos not implemented yet" });
};

const updateUserSettings = async (req, res) => {
  res.status(501).json({ message: "updateUserSettings not implemented yet" });
};

const updateUserProfile = async (req, res) => {
  res.status(501).json({ message: "updateUserProfile not implemented yet" });
};
// ❗ DEV / ADMIN ONLY
const removePurchasedCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await User.findById(req.user._id);
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

// ====================
// EXPORTS
// ====================
export {
  registerUser,
  loginUser,
  getUserProfile,
  purchaseCourse,
  updateCourseProgress,
  getWatchedVideos, // stub
  updateUserSettings, // stub
  updateUserProfile, // stub
  removePurchasedCourse,
};
