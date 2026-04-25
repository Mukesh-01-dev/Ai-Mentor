import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createComplaint, getMyComplaints, getAllComplaintsAndReports, updateComplaintStatus, moderateReport } from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

// Admin routes for unified complaints and reports view
router.get("/", protect, getAllComplaintsAndReports);
router.put("/:id/status", protect, updateComplaintStatus);
router.put("/:id/moderate", protect, moderateReport); // Handle both complaint and report moderation

export default router;
