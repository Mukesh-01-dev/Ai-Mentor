import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllAdmins,
} from "../controllers/authController.js";
import {
  getAllCourses,
  createCourse,
} from "../controllers/courseController.js";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import {
  getAllEnrollments,
  getAllPayments,
  getAllReports,
} from "../controllers/dataController.js";
import {
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { protectAdmin, superAdminOnly } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected routes
router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);

// Admin data routes
router.get("/enrollments", protectAdmin, getAllEnrollments);
router.get("/payments", protectAdmin, getAllPayments);
router.get("/courses", protectAdmin, getAllCourses);
router.post("/courses", protectAdmin, createCourse);
router.get("/users", protectAdmin, getAllUsers);
router.patch("/users/:id/status", protectAdmin, superAdminOnly, updateUserStatus);
router.delete("/users/:id", protectAdmin, superAdminOnly, deleteUser);
router.get("/reports", protectAdmin, getAllReports);
router.get("/admins", protectAdmin, superAdminOnly, getAllAdmins);

// Notifications
router.get("/notifications", protectAdmin, getAdminNotifications);
router.patch("/notifications/mark-all-read", protectAdmin, markAllNotificationsRead);
router.patch("/notifications/:id/read", protectAdmin, markNotificationRead);
router.delete("/notifications/clear", protectAdmin, clearAllNotifications);

export default router;
