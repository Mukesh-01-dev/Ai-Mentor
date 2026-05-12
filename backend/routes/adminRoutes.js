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

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);
router.get("/enrollments", protectAdmin, getAllEnrollments);
router.get("/payments", protectAdmin, getAllPayments);
router.get("/courses", protectAdmin, getAllCourses);
router.get("/users", protectAdmin, getAllUsers);

export default router;
