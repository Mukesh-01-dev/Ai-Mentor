import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/db.js";

class User extends Model { }

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // 🔹 Added username (Required for your registration logic)
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 🔹 Keep name, but allow it to be generated or updated via hooks
    name: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for Google users
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    bio: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    purchasedCourses: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    analytics: {
      type: DataTypes.JSONB,
      defaultValue: {
        totalHours: 0,
        daysStudied: 0,
        studySessions: [],
        lastStudyDate: null,
        attendance: 0,
        avgMarks: 0,
        dailyHours: 0,
        totalCourses: 0,
        completedCourses: 0,
        certificates: 0,
      },
    },
    learningHoursChart: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          courseUpdates: true,
          discussionReplies: true,
        },
        security: {
          twoFactorAuth: false,
          loginAlerts: true,
        },
        appearance: {
          theme: "light",
          language: "en",
        },
      },
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        // 1. Hash password only if it was changed
        if (user.password && user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }

        // 2. Automatically sync "name" field from firstName and lastName
        if (user.firstName || user.lastName) {
          user.name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        }

        // 3. Dynamically calculate isProfileComplete
        const hasBio = user.bio && user.bio.trim().length > 0;
        const hasAvatar = user.avatar_url && user.avatar_url.trim().length > 0;
        const hasFirstName = user.firstName && user.firstName.trim().length > 0;
        const hasLastName = user.lastName && user.lastName.trim().length > 0;
        const hasUsername = user.username && user.username.trim().length > 0;
        const hasPassword = user.password && user.password.trim().length > 0;
        
        // Logical check for completion
        if (user.googleId) {
          // Google users are complete if they add a Bio, Avatar, and eventually a password
          user.isProfileComplete = Boolean(hasBio && hasAvatar && hasFirstName && hasLastName && hasPassword);
        } else {
          // Email users are complete if names, username, bio, and avatar exist
          user.isProfileComplete = Boolean(hasBio && hasAvatar && hasFirstName && hasLastName && hasUsername);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;