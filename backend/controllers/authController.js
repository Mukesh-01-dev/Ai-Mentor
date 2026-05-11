import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= TOKEN ================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("👉 REGISTER BODY:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ❗ DO NOT HASH HERE (handled by Sequelize hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });

  } catch (error) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ================= LOGIN (FINAL FIXED + DEBUG) ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("👉 LOGIN BODY:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔥 DEBUG LOGS (IMPORTANT)
    console.log("🔐 RAW INPUT PASSWORD:", JSON.stringify(password));
    console.log("🗄 DB PASSWORD:", user.password);

    // 🔥 FIX: trim input password
    const cleanPassword = password.trim();

    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    console.log("✅ BCRYPT RESULT:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ================= GOOGLE LOGIN ================= */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Token missing",
      });
    }

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
      });
    }

    return res.json({
      success: true,
      token: generateToken(user.id),
      user,
    });

  } catch (error) {
    console.error("❌ Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: resetUrl,
    });

    return res.json({
      success: true,
      message: "Reset email sent",
    });

  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = req.body.password; // hook will hash it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
};