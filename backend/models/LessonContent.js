import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const LessonContent = sequelize.define("LessonContent", {
    lessonId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    introduction: DataTypes.TEXT,

    keyConcepts: {
        type: DataTypes.JSONB,
    },
});

export default LessonContent;