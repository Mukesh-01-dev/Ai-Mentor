import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,   // ✅ ADD THIS
    primaryKey: true,
  },

  title: DataTypes.STRING,
  category: DataTypes.STRING,
  categoryColor: DataTypes.STRING,

  lessons: DataTypes.STRING,
  lessonsCount: DataTypes.INTEGER,

  level: DataTypes.STRING,

  price: DataTypes.STRING,
  priceValue: DataTypes.INTEGER,
  currency: DataTypes.STRING,

  rating: DataTypes.FLOAT,

  students: DataTypes.STRING,
  studentsCount: DataTypes.INTEGER,

  image: {
    type: DataTypes.STRING,
    comment: "Course thumbnail path. Example: /uploads/courses/react.png"
  },

  isBookmarked: DataTypes.BOOLEAN,
});

export default Course;