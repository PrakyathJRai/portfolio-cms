
import { Router } from "express";

import {
  registerVisitor,
  loginVisitor,
  getVisitorProfile,
  updateVisitorProfile,
  changeVisitorPassword,
} from "../controllers/visitorAuthController.js";

import { authenticateVisitor } from "../middlewares/visitorAuthMiddleware.js";

const router = Router();

// Registration
router.post("/register", registerVisitor);

// Login
router.post("/login", loginVisitor);

// Get visitor profile
router.get("/profile", authenticateVisitor, getVisitorProfile);

// Update visitor profile
router.patch("/profile", authenticateVisitor, updateVisitorProfile);

// Change visitor password
router.patch(
  "/change-password",
  authenticateVisitor,
  changeVisitorPassword
);

export default router;
