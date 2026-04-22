import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import sendEmail from "../utils/sendEmail.js";
import { ensureProfileCompleteness, formatFullName } from "../utils/userUtils.js";
import cloudinary from "../config/cloudinary.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Centralized logic moved to userUtils.js

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: formatFullName(name, ""), // Standard register provides 'name', we treat as first part if needed
      email,
      password,
    });

    await ensureProfileCompleteness(user);

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
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
      isNewUser: true,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for email:", email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("User not found in DB.");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (user && user.password && isMatch) {
      console.log("Login successful!");
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
        googleId: user.googleId,
        hasPassword: !!user.password,
        purchasedCourses: user.purchasedCourses,
        isNewUser: false,
        token: generateToken(user.id),
      });

      import("../controllers/notificationController.js")
        .then(({ createNotification }) => {
          createNotification(user.id, {
            title: "New Login Detected",
            message: `A new login was detected for your account at ${new Date().toLocaleString()}.`,
            type: "security",
          });
        })
        .catch((error) => {
          console.error("Failed to load notificationController or send login notification:", error);
        });
    } else {
      console.log("Login failed: password mismatch.");
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// Background task to refresh/re-host avatar to Cloudinary without blocking login
const refreshAvatarInBackground = async (userId, googlePictureUrl) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.warn(`Skipping background avatar refresh because user ${userId} was not found`);
      return;
    }

    const result = await cloudinary.uploader.upload(googlePictureUrl, {
      folder: "user_avatars",
      public_id: `user_${userId}`,
      overwrite: true,
    });

    // Persist the new permanent Cloudinary URL, then recompute profile completeness
    user.avatar_url = result.secure_url;
    await user.save();
    await ensureProfileCompleteness(user);
    console.log(`Successfully refreshed/re-hosted avatar to Cloudinary for user ${userId}`);
  } catch (err) {
    console.error("Background avatar refresh failed:", err);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    // console.log("Google Login Payload:", JSON.stringify(payload, null, 2));
    const uid = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    let firstName = payload.given_name || "";
    let lastName = payload.family_name || "";
    const avatar_url = payload.picture || null;

    // Fallback if given_name and family_name are missing
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }
    const fullName = formatFullName(firstName, lastName);

    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: fullName,
        email,
        firstName,
        lastName,
        avatar_url,
        googleId: uid,
        role: "user",
      });
    } else {
      let changed = false;
      if (!user.googleId) {
        user.googleId = uid;
        changed = true;
      }

      // Pre-fill missing names/avatar from Google if they are empty
      if (!user.firstName && firstName) {
        user.firstName = firstName;
        changed = true;
      }
      if (!user.lastName && lastName) {
        user.lastName = lastName;
        changed = true;
      }
      if (!user.avatar_url && avatar_url) {
        user.avatar_url = avatar_url;
        changed = true;
      }
      
      // Update name if components changed
      if (changed) {
        user.name = formatFullName(user.firstName, user.lastName);
        await user.save();
      }
    }

    await ensureProfileCompleteness(user);

    // 🔥 OPTIMIZATION: Flicker-Free Avatar Re-hosting
    if (avatar_url) {
      const isCurrentlyGoogleHosted = user.avatar_url?.includes("googleusercontent.com");
      const isMissing = !user.avatar_url;

      if (isNewUser) {
        // For new users, we wait (sync) to ensure their first impression is perfect and initials don't flicker
        try {
          const result = await cloudinary.uploader.upload(avatar_url, {
            folder: "user_avatars",
            public_id: `user_${user.id}`,
            overwrite: true,
          });
          user.avatar_url = result.secure_url;
          await user.save();
        } catch (err) {
          console.error("Sync avatar re-hosting failed:", err);
          // Fallback: the response will still use the Google URL if Cloudinary fails
        }
      } else if (isCurrentlyGoogleHosted || isMissing) {
        // For returning users, keep it backgrounded (async) to maintain instant speed
        refreshAvatarInBackground(user.id, avatar_url);
      }
    }

    const token = generateToken(user.id);

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
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
      isNewUser,
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password for your account.</p>
      <p>Please click on the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
        html,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (err) {
      console.error("Email could not be sent", err);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;

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
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.set("password", password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    import("../controllers/notificationController.js")
      .then(({ createNotification }) => {
        createNotification(user.id, {
          title: "Password Changed",
          message: "Your password has been successfully reset. If this wasn't you, please secure your account.",
          type: "security",
        });
      })
      .catch((error) => {
        console.error("Password reset notification error:", error);
      });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
};