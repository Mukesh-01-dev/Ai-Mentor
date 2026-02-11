import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

class Discussion extends Model {}

Discussion.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    replies: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    likes: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    hasAISuggestion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    aiSuggestion: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Discussion",
    timestamps: true,
    indexes: [
      {
        fields: ["createdAt"],
      },
    ],
  }
);

Discussion.belongsTo(User, { foreignKey: "userId", as: "author" });
User.hasMany(Discussion, { foreignKey: "userId" });

export default Discussion;
