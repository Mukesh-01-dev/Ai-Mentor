import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  chatWithAssistant,
  getChatContext,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", protect, chatWithAssistant);
router.get("/context", protect, getChatContext);

export default router;