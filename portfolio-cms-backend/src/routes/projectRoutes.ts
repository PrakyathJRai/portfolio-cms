
import { Router } from "express";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route: Get all projects
router.get("/", getProjects);

// Protected routes: Admin authentication required
router.post("/", authenticateAdmin, createProject);
router.put("/:id", authenticateAdmin, updateProject);
router.delete("/:id", authenticateAdmin, deleteProject);

export default router;
