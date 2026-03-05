import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const DiscussionLike = sequelize.define("DiscussionLike", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  discussionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ["discussionId", "userId"],
    },
  ],
});

export default DiscussionLike;