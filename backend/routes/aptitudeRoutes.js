const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getQuiz, submitQuiz, getHistory } = require("../controllers/aptitudeController");

router.get("/quiz", protect, getQuiz);
router.post("/submit", protect, submitQuiz);
router.get("/history", protect, getHistory);

module.exports = router;
