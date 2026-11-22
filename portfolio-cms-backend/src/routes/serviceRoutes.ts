
import { Router } from "express";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Get all services (public)
router.get("/", getServices);

// Admin-only routes
router.post("/", authenticateAdmin, createService);
router.put("/:id", authenticateAdmin, updateService);
router.delete("/:id", authenticateAdmin, deleteService);

export default router;
