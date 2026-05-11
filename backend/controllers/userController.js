import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* ================= REGISTER USER ================= */
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, name, email, password } = req.body;

    console.log("REGISTER BODY:", req.body);

    // check existing user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      firstName,
      lastName,
      name,
      email,
      password: hashedPassword,
      isProfileComplete: false,
    });

    // generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      isProfileComplete: false,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

/* ================= LOGIN USER ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

/* ================= COMPLETE PROFILE ================= */
export const completeProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, bio } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    if (bio) user.bio = bio;

    // avatar upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "user_avatars",
          public_id: `user_${user.id}`,
          overwrite: true,
        });

        user.avatar_url = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Cloudinary error:", err.message);
      }
    }

    user.isProfileComplete = true;

    await user.save();

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatar_url,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Profile update failed",
    });
  }
};

/* ================= OTHER APIs (PLACEHOLDERS) ================= */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  res.json({ message: "Profile updated" });
};

export const changePassword = async (req, res) => {
  res.json({ message: "Password updated" });
};

export const purchaseCourse = async (req, res) => {
  res.json({ message: "Course purchased" });
};

export const updateCourseProgress = async (req, res) => {
  res.json({ message: "Progress updated" });
};

export const getWatchedVideos = async (req, res) => {
  res.json({ message: "Watched videos" });
};

export const removePurchasedCourse = async (req, res) => {
  res.json({ message: "Course removed" });
};

export const getUserSettings = async (req, res) => {
  res.json({ message: "Settings data" });
};

export const updateUserSettings = async (req, res) => {
  res.json({ message: "Settings updated" });
};

export const deleteAccount = async (req, res) => {
  res.json({ message: "Account deleted" });
};