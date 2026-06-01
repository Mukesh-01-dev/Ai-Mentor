import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const CourseFeedback = sequelize.define("CourseFeedback", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },

  review: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "",
  },

  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  userAvatar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default CourseFeedback;
