import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const LessonContent = sequelize.define("LessonContent", {
    id: {   // ✅ OPTIONAL BUT BEST PRACTICE
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    lessonId: {
        type: DataTypes.INTEGER,   // ✅ FIXED
        allowNull: false,
    },

    introduction: DataTypes.TEXT,

    keyConcepts: {
        type: DataTypes.JSONB,
    },
});

export default LessonContent;