import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const CommunityPost = sequelize.define(
  "CommunityPost",
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
    type: {
      type: DataTypes.ENUM("course", "global"),
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    dislikes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    replies: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    hiddenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    tableName: "CommunityPosts",
  }
);

export default CommunityPost;