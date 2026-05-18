import { sequelize } from "./config/db.js";

async function addStatusColumn() {
  try {
    console.log("Adding status column to Users table...");
    await sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT \'active\'');
    console.log("✅ Column added successfully!");
  } catch (error) {
    console.error("❌ Error adding column:", error.message);
  } finally {
    await sequelize.close();
  }
}

addStatusColumn();
