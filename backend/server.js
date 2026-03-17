import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import "./models/CommunityPost.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS FIRST
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Optional but helpful for preflight
app.options("*", cors());

// Stripe webhook route before express.json()
app.use("/api/stripe", stripeWebhookRoutes);

// Normal JSON parser
app.use(express.json());

// Static folders
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/community", communityRoutes);
console.log("Mounting payment routes...");
app.use("/api/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);
console.log("paymentRoutes file loaded");

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
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