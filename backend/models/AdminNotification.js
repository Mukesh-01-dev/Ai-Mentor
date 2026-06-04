import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const AdminNotification = sequelize.define(
  "AdminNotification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "general",
    },
    unread: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "AdminNotifications",
  }
);

export default AdminNotification;
