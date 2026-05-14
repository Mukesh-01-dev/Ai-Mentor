import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.SUPER_ADMIN_EMAIL;
    const adminExists = await Admin.findOne({ where: { email } });

    if (adminExists) {
      console.log("SuperAdmin already exists.");
    } else {
      await Admin.create({
        name: process.env.SUPER_ADMIN_NAME,
        email: email,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: "superAdmin",
      });
      console.log("SuperAdmin created successfully!");
    }
    process.exit();
  } catch (error) {
    console.error("Error seeding SuperAdmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
