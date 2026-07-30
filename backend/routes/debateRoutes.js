const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getChallenges, submitDefense } = require("../controllers/debateController");

router.post("/challenge", protect, getChallenges);
router.post("/evaluate", protect, submitDefense);

module.exports = router;
