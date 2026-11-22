
import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
} from "../controllers/authController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected admin route
router.get("/profile", authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully!",
    adminId: req.adminId,
  });
});

export default router;
