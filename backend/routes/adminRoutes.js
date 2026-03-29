import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAdminUsers,
  updateUserRole,
  deleteUserByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, admin, getAdminUsers);
router.put("/users/:userId/role", protect, admin, updateUserRole);
router.delete("/users/:userId", protect, admin, deleteUserByAdmin);

export default router;
