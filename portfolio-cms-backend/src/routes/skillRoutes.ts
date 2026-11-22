
import { Router } from "express";

import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";

import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route: Get all skills
router.get("/", getSkills);

// Protected routes: Admin authentication required
router.post("/", authenticateAdmin, createSkill);
router.put("/:id", authenticateAdmin, updateSkill);
router.delete("/:id", authenticateAdmin, deleteSkill);

export default router;
