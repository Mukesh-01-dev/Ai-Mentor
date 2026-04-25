import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  getAllUsers
} from "../controllers/adminController.js";
import { protectAdmin, superAdminOnly } from "../middleware/adminAuthMiddleware.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  listUsersForAdmin,
  updateUserRoleByAdmin,
  deleteUserByAdmin,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);
router.get("/enrollments", protect, admin, getAllEnrollments);
// router.get("/payments", protectAdmin, getAllPayments);
// router.get("/courses", protectAdmin, getAllCourses);
// router.get("/users", protectAdmin, getAllUsers);

// User admin management via user-role based auth (shared with course/community admin APIs)
router.get("/users", protect, admin, listUsersForAdmin);
router.put("/users/:id/role", protect, admin, updateUserRoleByAdmin);
router.delete("/users/:id", protect, admin, deleteUserByAdmin);
router.get("/enrollments", protectAdmin, getAllEnrollments);
router.get("/payments", protectAdmin, getAllPayments);
router.get("/courses", protectAdmin, getAllCourses);
router.get("/users", protectAdmin, getAllUsers);

export default router;
