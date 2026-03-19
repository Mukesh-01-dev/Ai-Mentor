// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
//import discussionRoutes from "./routes/discussionRoutes.js"; // Replaced by communityRoutes.js
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import "./models/CommunityPost.js";
import "./models/Notification.js";
import Course from "./models/Course.js";
import Module from "./models/Module.js";
import Lesson from "./models/Lesson.js";

// Set up model associations
Course.hasMany(Module, { foreignKey: "courseId", onDelete: "CASCADE" });
Module.belongsTo(Course, { foreignKey: "courseId" });

Module.hasMany(Lesson, { foreignKey: "moduleId", onDelete: "CASCADE" });
Lesson.belongsTo(Module, { foreignKey: "moduleId" });

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  "/videos",
  express.static(path.join(__dirname, "videos"))
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/uploads", express.static("uploads"));

// ✅ REGISTER ROUTES (CORRECT PLACE)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
//app.use("/api/discussions", discussionRoutes);   // Replaced by communityRoutes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    // Sync database models
    // Use force: true to drop and recreate tables (FOR FIRST TIME SETUP ONLY)
    // Use alter: true for gradual schema updates (safer for production)
    const forceSync = process.env.FORCE_SYNC === 'true';
    await sequelize.sync({ force: forceSync || false, alter: !forceSync });
    console.log("✅ Database models synced successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();