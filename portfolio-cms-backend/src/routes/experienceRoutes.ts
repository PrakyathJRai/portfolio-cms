
import { Router } from "express";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experienceController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Get all experiences (public)
router.get("/", getExperiences);

// Admin-only routes
router.post("/", authenticateAdmin, createExperience);
router.put("/:id", authenticateAdmin, updateExperience);
router.delete("/:id", authenticateAdmin, deleteExperience);

export default router;
