// backendAdmin/seed_reports.js
import { sequelize } from "./config/db.js";
import { DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Define models briefly for seeding
const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, defaultValue: "user" },
}, { timestamps: true, tableName: "Users" });

const CommunityPost = sequelize.define("CommunityPost", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: DataTypes.TEXT,
  userId: DataTypes.UUID,
  type: { type: DataTypes.STRING, defaultValue: "global" },
}, { timestamps: true, tableName: "CommunityPosts" });

const Report = sequelize.define("Report", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporterId: { type: DataTypes.UUID, allowNull: false },
  postId: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
}, { timestamps: true, tableName: "Reports" });

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB");

    await CommunityPost.sync();
    await Report.sync();

    let users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      users = await User.bulkCreate([
        { name: "John Reporter", email: "john_test" + Date.now() + "@example.com", role: "user" },
        { name: "Alice Author", email: "alice_test" + Date.now() + "@example.com", role: "user" },
      ]);
      console.log("✅ Created users");
    }

    let post = await CommunityPost.findOne();
    if (!post) {
      post = await CommunityPost.create({
        content: "Seeded test post for reporting",
        userId: users[1].id,
      });
      console.log("✅ Created post");
    }

    const reports = await Report.bulkCreate([
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "spam",
        description: "This is a seeded test report for spam.",
      },
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "harassment",
        description: "This is a seeded test report for harassment.",
      }
    ]);
    console.log(`✅ Created ${reports.length} reports`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
