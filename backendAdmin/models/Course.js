import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    category: DataTypes.STRING,
    priceValue: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "published",
      validate: {
        isIn: [["published", "disabled", "deleted"]],
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    tableName: "Courses",
    sync: { alter: false },
  }
);

export default Course;
