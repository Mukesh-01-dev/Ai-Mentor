import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/db.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    bio: {
      type: DataTypes.STRING,
      defaultValue: "",
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
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.password && user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;
