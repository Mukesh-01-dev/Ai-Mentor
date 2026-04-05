// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB, sequelize } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import paymentRoutes from "./routes/payment.js";

// MODELS
import "./models/CommunityPost.js";
import "./models/Notification.js";
import "./models/Report.js";
import "./models/modelAssociations.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

/* ================= STATIC ================= */
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/uploads", express.static("uploads"));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

/* ================= ROUTES ================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ REGISTER ROUTES (CORRECT PLACE)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes); // ✅ STRIPE ROUTE ADDED
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificate", certificateRoutes);

/* ================= GLOBAL ERROR ================= */
app.use((err, req, res, _next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: true });
    console.log("✅ Database models synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
};

startServer();