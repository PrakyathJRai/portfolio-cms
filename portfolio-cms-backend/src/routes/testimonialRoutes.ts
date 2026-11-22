
import { Router } from "express";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Get all testimonials (public)
router.get("/", getTestimonials);

// Admin-only routes
router.post("/", authenticateAdmin, createTestimonial);
router.put("/:id", authenticateAdmin, updateTestimonial);
router.delete("/:id", authenticateAdmin, deleteTestimonial);

export default router;
