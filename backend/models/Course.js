import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: DataTypes.STRING,
  category: DataTypes.STRING,
  categoryColor: DataTypes.STRING,

  // ✅ Numeric — enables sorting, filtering, and calculations
  lessons: DataTypes.INTEGER,

  level: DataTypes.STRING,

  // ✅ Single numeric price field — format as "₹999" on the frontend
  price: {
    type: DataTypes.FLOAT,
    comment: "Raw price value. Example: 999.00",
  },
  currency: DataTypes.STRING,

  rating: DataTypes.FLOAT,

  // ✅ Numeric — enables aggregation across courses
  students: DataTypes.INTEGER,

  image: {
    type: DataTypes.STRING,
    comment: "Course thumbnail path. Example: /uploads/courses/react.png",
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "published",
    validate: {
      isIn: [["published", "disabled", "deleted"]],
    },
  },
});

export default Course;