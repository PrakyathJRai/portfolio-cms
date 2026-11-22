
import { Router } from "express";

import {
  createMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/messageController.js";

import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route: Submit contact form
router.post("/", createMessage);

// Admin-only routes
router.get("/", authenticateAdmin, getMessages);

router.patch("/:id/read", authenticateAdmin, markMessageAsRead);

router.delete("/:id", authenticateAdmin, deleteMessage);

export default router;
