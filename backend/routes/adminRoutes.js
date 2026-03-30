import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
} from "../controllers/adminController.js";
import { protectAdmin, superAdminOnly } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);

export default router;
