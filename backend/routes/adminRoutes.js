import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllAdmins,
  getDashboardSummary,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/adminController.js";
import { getAllComplaintsAndReports, moderateReport } from "../controllers/complaintController.js";
import { addCourse, updateCourse, deleteCourse, addModules, addLessons, updateLessonVideo, addSubtopics } from "../controllers/courseController.js";
import { protectAdmin, superAdminOnly, anyAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);

router.get("/dashboard", protectAdmin, anyAdmin, getDashboardSummary);

router.get("/users", protectAdmin, anyAdmin, getAllUsers);
router.put("/users/:id/role", protectAdmin, anyAdmin, updateUserRole);
router.delete("/users/:id", protectAdmin, anyAdmin, deleteUser);

router.get("/enrollments", protectAdmin, anyAdmin, getAllEnrollments);
router.get("/payments", protectAdmin, anyAdmin, getAllPayments);

router.get("/courses", protectAdmin, anyAdmin, getAllCourses);
router.post("/courses", protectAdmin, anyAdmin, addCourse);
router.put("/courses/:id", protectAdmin, anyAdmin, updateCourse);
router.delete("/courses/:id", protectAdmin, anyAdmin, deleteCourse);
router.post("/courses/:courseId/modules", protectAdmin, anyAdmin, addModules);
router.post("/courses/:courseId/modules/:moduleId/lessons", protectAdmin, anyAdmin, addLessons);
router.put("/courses/:courseId/lessons/:lessonId/video", protectAdmin, anyAdmin, updateLessonVideo);
router.post("/courses/:courseId/subtopics", protectAdmin, anyAdmin, addSubtopics);

// Unified complaints and reports endpoint
router.get("/complaints", protectAdmin, anyAdmin, getAllComplaintsAndReports);
router.put("/complaints/:id/status", protectAdmin, anyAdmin, updateComplaintStatus);
router.put("/complaints/:id/moderate", protectAdmin, anyAdmin, moderateReport);

router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/admins", protectAdmin, superAdminOnly, getAllAdmins);
router.post("/admins", protectAdmin, superAdminOnly, registerAdmin);
router.delete("/admins/:id", protectAdmin, superAdminOnly, deleteAdmin);

// Backward-compatible legacy endpoint
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);

export default router;
