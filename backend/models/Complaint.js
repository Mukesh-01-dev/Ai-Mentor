import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Admin from "./Admin.js";

class Complaint extends Model {}

Complaint.init(
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
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Admin,
        key: "id",
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Complaint",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["status"] }, { fields: ["createdAt"] }],
  }
);

Complaint.belongsTo(User, { foreignKey: "userId", as: "user" });
Complaint.belongsTo(Admin, { foreignKey: "resolvedByAdminId", as: "resolvedBy" });

export default Complaint;
