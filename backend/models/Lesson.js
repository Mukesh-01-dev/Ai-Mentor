import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Lesson = sequelize.define("Lesson", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    moduleId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    title: DataTypes.STRING,

    duration: DataTypes.STRING,

    completed: DataTypes.BOOLEAN,

    playing: DataTypes.BOOLEAN,

    type: DataTypes.STRING,

    youtubeUrl: DataTypes.STRING,

    order: DataTypes.INTEGER
});

export default Lesson;