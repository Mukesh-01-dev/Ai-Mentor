import crypto from "crypto";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import sendEmail from "../utils/sendEmail.js";
import { ensureProfileCompleteness, formatFullName } from "../utils/userUtils.js";
import cloudinary from "../config/cloudinary.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// --- REGISTER ---
const register = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      username: username || email.split("@")[0],
      name: formatFullName(firstName, lastName),
      email,
      password,
    });

    await ensureProfileCompleteness(user);

    return res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      username: user.username,
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
    console.error("❌ Register Controller Error:", error);
    return res.status(500).json({ message: "Database Error: " + error.message });
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      await ensureProfileCompleteness(user);
      
      const responseData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        username: user.username,
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
      };

      // Background notification - don't await to keep login fast
      import("../controllers/notificationController.js")
        .then(({ createNotification }) => {
          createNotification(user.id, {
            title: "New Login Detected",
            message: `A new login was detected at ${new Date().toLocaleString()}.`,
            type: "security",
          });
        })
        .catch((err) => console.error("Notification Error:", err));

      return res.json(responseData);
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// --- GOOGLE LOGIN ---
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());

    const uid = payload.sub;
    const email = payload.email;
    const googleFirstName = payload.given_name || "";
    const googleLastName = payload.family_name || "";
    const googlePicture = payload.picture || null;

    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        firstName: googleFirstName,
        lastName: googleLastName,
        name: formatFullName(googleFirstName, googleLastName),
        email,
        username: email.split("@")[0],
        avatar_url: googlePicture,
        googleId: uid,
        role: "user",
      });
    } else {
      let changed = false;
      if (!user.googleId) { user.googleId = uid; changed = true; }
      if (!user.firstName && googleFirstName) { user.firstName = googleFirstName; changed = true; }
      if (!user.lastName && googleLastName) { user.lastName = googleLastName; changed = true; }
      
      if (changed) {
        user.name = formatFullName(user.firstName, user.lastName);
        await user.save();
      }
    }

    await ensureProfileCompleteness(user);

    // Sync avatar for new users, background for existing
    if (googlePicture) {
      if (isNewUser) {
        try {
          const result = await cloudinary.uploader.upload(googlePicture, {
            folder: "user_avatars",
            public_id: `user_${user.id}`,
            overwrite: true,
          });
          user.avatar_url = result.secure_url;
          await user.save();
        } catch (err) {
          console.error("Sync avatar failed:", err);
        }
      } else {
        refreshAvatarInBackground(user.id, googlePicture);
      }
    }

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
      googleId: user.googleId,
      hasPassword: !!user.password,
      purchasedCourses: user.purchasedCourses,
      isNewUser,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};

// --- HELPERS & PW RESET ---

const refreshAvatarInBackground = async (userId, googlePictureUrl) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;
    const result = await cloudinary.uploader.upload(googlePictureUrl, {
      folder: "user_avatars",
      public_id: `user_${userId}`,
      overwrite: true,
    });
    user.avatar_url = result.secure_url;
    await user.save();
    await ensureProfileCompleteness(user);
  } catch (err) {
    console.error("Background avatar refresh failed:", err);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = `<h1>Password Reset</h1><p>Click here: <a href="${resetUrl}">${resetUrl}</a></p>`;

    await sendEmail({ email: user.email, subject: "Password Reset Token", html });
    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export { register, login, googleLogin, forgotPassword, resetPassword };