const express = require("express");
const router = express.Router();
const { getOverview, getScorecard, getRoadmap } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/overview", protect, getOverview);
router.get("/scorecard", protect, getScorecard);
router.get("/roadmap", protect, getRoadmap);

module.exports = router;
