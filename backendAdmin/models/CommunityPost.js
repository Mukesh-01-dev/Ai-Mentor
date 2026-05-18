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
    content: DataTypes.TEXT,
    userId: DataTypes.UUID,
  },
  {
    timestamps: true,
    tableName: "CommunityPosts",
  }
);

export default CommunityPost;
