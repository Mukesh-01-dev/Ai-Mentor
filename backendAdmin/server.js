// backendAdmin/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      process.env.FRONTEND_ADMIN_URL || "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ================= ROUTES =================
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Backend Admin Server is running" });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ================= SERVER STARTUP =================
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Backend Admin Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
