import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
class CalendarTask extends Model { }
CalendarTask.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "Upcoming",
        },
    },
    {
        sequelize,
        modelName: "CalendarTask",
        tableName: "CalendarTasks",
        timestamps: true,
    }
);
export default CalendarTask;
