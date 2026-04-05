import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Module = sequelize.define("Module", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    title: DataTypes.STRING,

    order: DataTypes.INTEGER
});

export default Module;