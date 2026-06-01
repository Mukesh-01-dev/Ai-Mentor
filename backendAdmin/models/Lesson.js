import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Lesson = sequelize.define(
  "Lesson",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    moduleId: { type: DataTypes.INTEGER, allowNull: false },
    title: DataTypes.STRING,
    duration: DataTypes.STRING,
    type: DataTypes.STRING,
    youtubeUrl: DataTypes.STRING,
    order: DataTypes.INTEGER,
  },
  { timestamps: true, tableName: "Lessons" }
);

export default Lesson;
