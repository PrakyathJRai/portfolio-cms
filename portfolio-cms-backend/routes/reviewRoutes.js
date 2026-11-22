
const express = require("express");
const router = express.Router();

const {
  createReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a new code review
router.post("/", authMiddleware, createReview);

module.exports = router;
