const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getQuiz, submitQuiz } = require("../controllers/situationalController");

router.get("/quiz", protect, getQuiz);
router.post("/submit", protect, submitQuiz);

module.exports = router;
