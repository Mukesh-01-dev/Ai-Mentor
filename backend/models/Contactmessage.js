import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ContactMessage = sequelize.define(
  "ContactMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Email is required",
        },
        isEmail: {
          msg: "Please enter a valid email address",
        },
      },
    },

    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Subject is required",
        },
        len: {
          args: [3, 100],
          msg: "Subject must be between 3 and 100 characters",
        },
      },
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Message is required",
        },
        len: {
          args: [10, 2000],
          msg: "Message must be between 10 and 2000 characters",
        },
      },
    },
  },
  {
    tableName: "contact_messages",
    timestamps: true,
    underscored: true,
  },
);

export default ContactMessage;
