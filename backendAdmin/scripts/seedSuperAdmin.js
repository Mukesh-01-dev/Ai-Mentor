import dotenv from "dotenv";
import { connectDB, sequelize } from "../config/db.js";
import { Admin } from "../models/index.js";

dotenv.config();

const seedSuperAdmin = async () => {
  const name = process.env.SUPER_ADMIN_NAME || process.env.ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "Missing super admin env vars. Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD in backendAdmin/.env"
    );
    process.exit(1);
  }

  try {
    await connectDB();
    await Admin.sync();

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      console.log("Super admin already exists for this email.");
      process.exit(0);
    }

    await Admin.create({
      name,
      email,
      password,
      role: "superadmin",
    });

    console.log("Super admin created successfully in backendAdmin.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed super admin:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close().catch(() => {});
  }
};

seedSuperAdmin();
