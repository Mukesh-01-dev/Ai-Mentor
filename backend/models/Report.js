import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import CommunityPost from "./CommunityPost.js";

class Report extends Model {}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: CommunityPost,
        key: "id",
      },
    },
    replyId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reason: {
      type: DataTypes.ENUM("spam", "harassment", "inappropriate", "misinformation", "other"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved"),
      defaultValue: "pending",
    },
    action: {
      type: DataTypes.ENUM("hidden", "deleted", "dismissed"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Report",
    timestamps: true,
    indexes: [
      { fields: ["postId"] },
      { fields: ["status"] },
      {
        unique: true,
        fields: ["reporterId", "postId", "replyId"],
        name: "unique_report_per_user",
      },
    ],
  }
);

Report.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });
Report.belongsTo(CommunityPost, { foreignKey: "postId", as: "post" });

export default Report;
