import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

class CourseReport extends Model {}

CourseReport.init(
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

    reportType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    courseName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "resolved"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "CourseReport",
    timestamps: true,
  },
);

CourseReport.belongsTo(User, { foreignKey: "userId", as: "user" });

export default CourseReport;
