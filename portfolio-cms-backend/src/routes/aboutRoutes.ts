
import { Router } from "express";

import {
  getAbout,
  createAbout,
  updateAbout,
} from "../controllers/aboutController.js";

import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route: Anyone can view About information
router.get("/", getAbout);

// Protected routes: Only authenticated admins
router.post("/", authenticateAdmin, createAbout);
router.put("/", authenticateAdmin, updateAbout);

export default router;
