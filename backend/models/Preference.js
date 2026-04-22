import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Preference extends Model {}

Preference.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    learning_goal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interested_topics: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('interested_topics');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val) {
        this.setDataValue('interested_topics', JSON.stringify(val || []));
      }
    },
    experience_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weekly_commitment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    learning_style: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Preference",
    tableName: "Preferences",
    timestamps: true,
  }
);

export default Preference;
