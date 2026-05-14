/**
 * Migration Script: Add course status management columns
 * 
 * This script:
 * 1. Adds `status` column to Users table (fixes pre-existing crash)
 * 2. Adds `status` column to Courses table (new feature)
 * 3. Adds `deletedAt` column to Courses table (soft delete support)
 * 4. Back-fills all existing courses with status = 'published'
 * 
 * Safe to run multiple times (uses IF NOT EXISTS).
 */

import { sequelize } from "../config/db.js";

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    // 1. Fix Users table — add missing `status` column
    console.log("\n🔧 Step 1: Adding 'status' column to Users table...");
    await sequelize.query(`
      ALTER TABLE "Users"
      ADD COLUMN IF NOT EXISTS "status" VARCHAR(255) DEFAULT 'active';
    `);
    console.log("   ✅ Users.status column ready.");

    // 2. Add `status` column to Courses table
    console.log("\n🔧 Step 2: Adding 'status' column to Courses table...");
    await sequelize.query(`
      ALTER TABLE "Courses"
      ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'published';
    `);
    console.log("   ✅ Courses.status column ready.");

    // 3. Add `deletedAt` column to Courses table
    console.log("\n🔧 Step 3: Adding 'deletedAt' column to Courses table...");
    await sequelize.query(`
      ALTER TABLE "Courses"
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log("   ✅ Courses.deletedAt column ready.");

    // 4. Back-fill existing courses
    console.log("\n🔧 Step 4: Back-filling existing courses with status = 'published'...");
    const [, meta] = await sequelize.query(`
      UPDATE "Courses" SET "status" = 'published' WHERE "status" IS NULL;
    `);
    console.log(`   ✅ Back-filled ${meta?.rowCount ?? 0} courses.`);

    // 5. Verify
    console.log("\n🔍 Verification:");
    const [courses] = await sequelize.query(`
      SELECT id, title, status, "deletedAt" FROM "Courses" LIMIT 5;
    `);
    console.table(courses);

    const [users] = await sequelize.query(`
      SELECT id, name, status FROM "Users" LIMIT 3;
    `);
    console.table(users);

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
};

migrate();
