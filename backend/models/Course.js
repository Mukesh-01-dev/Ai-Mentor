import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Course extends Model {}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    level: {
      type: DataTypes.STRING,
    },
    lessons: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.FLOAT,
    },
    students: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.FLOAT,
    },
    image: {
      type: DataTypes.STRING,
    },
    categoryColor: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "Course",
    timestamps: false,
  }
);

export default Course;
