import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPreferences,
  createPreferences,
  updatePreferences
} from "../controllers/preferenceController.js";

const router = express.Router();

router.route("/")
  .get(protect, getPreferences)
  .post(protect, createPreferences)
  .put(protect, updatePreferences);

export default router;
