console.log("Chat Routes Loaded");
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getChatContext,
  chatWithAssistant
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/context", protect, getChatContext);

router.post(
  "/",
  protect,
  chatWithAssistant
);

export default router;