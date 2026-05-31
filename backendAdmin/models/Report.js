import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "Reports",
  }
);

export default Report;
