
import { Router } from "express";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Get all blogs (public)
router.get("/", getBlogs);

// Admin-only routes
router.post("/", authenticateAdmin, createBlog);
router.put("/:id", authenticateAdmin, updateBlog);
router.delete("/:id", authenticateAdmin, deleteBlog);

export default router;
