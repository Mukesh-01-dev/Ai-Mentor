import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const resetAdmin = async () => {
    try {
        await connectDB();

        // Delete existing admin
        await Admin.destroy({ where: { email: process.env.SUPER_ADMIN_EMAIL } });
        console.log("Old admin deleted!");

        // Create new admin
        await Admin.create({
            name: process.env.SUPER_ADMIN_NAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: process.env.SUPER_ADMIN_PASSWORD,
            role: "superAdmin",
        });
        console.log("New admin created successfully!");
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetAdmin();