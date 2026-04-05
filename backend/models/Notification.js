import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

class Notification extends Model { }

Notification.init(
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(
                "academic",
                "course",
                "achievement",
                "social",
                "account",
                "security",
                "success",
                "system"
            ),
            defaultValue: "system",
        },
        unread: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Notification",
        timestamps: true,
        indexes: [
            { fields: ["userId"] },
            { fields: ["unread"] },
            { fields: ["createdAt"] },
        ],
    }
);

Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

export default Notification;
