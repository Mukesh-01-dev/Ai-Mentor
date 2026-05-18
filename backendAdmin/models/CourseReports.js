import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CourseReports = sequelize.define(
  "CourseReports",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    reportType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "resolved"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
  },
);
