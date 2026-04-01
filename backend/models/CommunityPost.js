import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

class CommunityPost extends Model {}

CommunityPost.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
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
    sequelize,
    modelName: "CommunityPost",
    timestamps: true,
    indexes: [
      { fields: ["type"] },
      { fields: ["courseId"] },
      { fields: ["createdAt"] },
    ],
  }
);

CommunityPost.belongsTo(User, { foreignKey: "userId", as: "author" });
User.hasMany(CommunityPost, { foreignKey: "userId" });

export default CommunityPost;
