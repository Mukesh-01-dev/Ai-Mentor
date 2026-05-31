import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from "bcryptjs";

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("superadmin", "admin"),
      defaultValue: "admin",
    },
  },
  {
    timestamps: true,
    tableName: "Admins",
  }
);

Admin.beforeCreate(async (admin) => {
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

Admin.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default Admin;
