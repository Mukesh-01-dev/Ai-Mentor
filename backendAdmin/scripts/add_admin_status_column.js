import { sequelize } from "../config/db.js";

async function addAdminStatusColumn() {
  try {
    console.log("Adding status column to Admins table...");
    await sequelize.query('ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT \'active\'');
    console.log("✅ Column added successfully!");
  } catch (error) {
    console.error("❌ Error adding column:", error.message);
  } finally {
    await sequelize.close().catch(() => {});
  }
}

addAdminStatusColumn();
