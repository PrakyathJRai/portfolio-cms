
import { Router } from "express";

import {
  uploadMedia,
  getMedia,
  deleteMedia,
} from "../controllers/mediaController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Get all uploaded images
router.get("/", authenticateAdmin, getMedia);

// Upload a new image
router.post(
  "/",
  authenticateAdmin,
  upload.single("image"),
  uploadMedia
);

// Delete an image by ID
router.delete("/:id", authenticateAdmin, deleteMedia);

export default router;
