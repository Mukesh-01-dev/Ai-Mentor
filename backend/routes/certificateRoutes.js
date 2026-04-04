import express from "express";
import { getCertificates, generateCertificate } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, getCertificates);
router.get("/generate", protect, generateCertificate);

export default router;
