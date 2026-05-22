import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./models/Course.js";
// Import DB and Sequelize instance
import { connectDB, sequelize } from "./config/db.js";

// ================= ROUTES =================
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
import preferenceRoutes from "./routes/preferenceRoutes.js";
import contactUsRoutes from "./routes/contactus.js";

// ================= MODELS =================
import "./models/User.js"; 
import "./models/CommunityPost.js";
import "./models/Notification.js";
import "./models/Report.js";
import "./models/modelAssociations.js";
import "./models/contactMessage.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"], 
    credentials: true,
  }),
);

// ================= STATIC FILES =================
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "✅ API is running..." });
});

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); 
app.use("/api/user-profile", userRoutes); 
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/contactus", contactUsRoutes);

// ================= ERROR HANDLERS =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("🔥 Global Error Logged:", err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synced");

    // Listening on 0.0.0.0 or 127.0.0.1 works best with the proxy
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`🚀 Backend running at http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
};

startServer();