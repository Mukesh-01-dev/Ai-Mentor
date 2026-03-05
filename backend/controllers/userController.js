import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

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

    const { courseId, completedLesson, currentLesson, lessonData } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the purchased course
    const courseIndex = user.purchasedCourses.findIndex(
      (c) => Number(c.courseId) === Number(courseId)
    );

    if (courseIndex === -1) {
      return res.status(404).json({ message: "Course not found in user's library" });
    }

    // Get the course
    const purchasedCourses = [...user.purchasedCourses];
    const course = { ...purchasedCourses[courseIndex] };
    course.progress = course.progress || { completedLessons: [], currentLesson: null, lessonData: {} };

    // Update completed lessons
    if (completedLesson) {
      const alreadyCompleted = course.progress.completedLessons.some(
        (l) => l.lessonId === completedLesson.lessonId
      );
      if (!alreadyCompleted) {
        course.progress.completedLessons.push(completedLesson);
      }
    }

    // Update current lesson
    if (currentLesson) {
      course.progress.currentLesson = currentLesson;
    }

    // Update lesson-specific data (e.g., AI captions/text)
    if (lessonData) {
      course.progress.lessonData = {
        ...(course.progress.lessonData || {}),
        [lessonData.lessonId]: {
          ...(course.progress.lessonData?.[lessonData.lessonId] || {}),
          ...lessonData.data
        }
      };
    }

    // Update analytics (simple example)
    user.analytics = user.analytics || {
      totalHours: 0,
      daysStudied: 0,
      completedCourses: 0,
      certificates: 0,
      studySessions: [],
      learningHoursChart: [],
    };

    purchasedCourses[courseIndex] = course;
    user.purchasedCourses = purchasedCourses;

    
    user.changed("purchasedCourses", true);
    await user.save();
    console.log("Updated completedLessons:", course.progress.completedLessons);

    res.json({ message: "Progress updated successfully", purchasedCourses: user.purchasedCourses });
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
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only provided fields
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

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        name: {
          [Op.iLike]: `${q}%`,   // prefix search, case-insensitive
        },
      },
      attributes: ["id", "name"],
      limit: 5,
      order: [["name", "ASC"]],
    });

    res.json(users);
  } catch (error) {
    console.error("SEARCH USER ERROR:", error);
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
  searchUsers,
};
