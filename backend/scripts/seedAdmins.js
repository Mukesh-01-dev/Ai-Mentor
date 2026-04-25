import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const seedAdmins = async () => {
  try {
    console.log("\n🌱 Starting admin seeding...\n");

    await connectDB();
    console.log("✅ Database connected\n");

    // Super Admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminExists = await Admin.findOne({ where: { email: superAdminEmail } });

    if (superAdminExists) {
      console.log(`⚠️  SuperAdmin with email ${superAdminEmail} already exists.`);
    } else {
      await Admin.create({
        name: process.env.SUPER_ADMIN_NAME || "Super Admin",
        email: superAdminEmail,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: "superAdmin",
      });
      console.log(`✅ SuperAdmin created successfully!`);
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Name: ${process.env.SUPER_ADMIN_NAME || "Super Admin"}\n`);
    }

    // Regular Admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminExists = await Admin.findOne({ where: { email: adminEmail } });

      if (adminExists) {
        console.log(`⚠️  Admin with email ${adminEmail} already exists.`);
      } else {
        await Admin.create({
          name: process.env.ADMIN_NAME || "Admin",
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD,
          role: "admin",
        });
        console.log(`✅ Admin created successfully!`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Name: ${process.env.ADMIN_NAME || "Admin"}\n`);
      }
    } else {
      console.log("⚠️  ADMIN_EMAIL not set in environment variables. Skipping regular admin creation.\n");
    }

    console.log("🎉 Admin seeding completed!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding admins:", error.message);
    process.exit(1);
  }
};

seedAdmins();
