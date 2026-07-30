const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getResume, saveResume, suggestSummary, suggestBullets, downloadResume,
} = require("../controllers/resumeController");

router.get("/", protect, getResume);
router.put("/", protect, saveResume);
router.post("/suggest-summary", protect, suggestSummary);
router.post("/suggest-bullets", protect, suggestBullets);
router.get("/download", protect, downloadResume);

module.exports = router;
