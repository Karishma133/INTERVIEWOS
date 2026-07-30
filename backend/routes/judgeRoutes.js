const express = require("express");
const router = express.Router();
const { submitCode } = require("../controllers/judgeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/submit", protect, submitCode);

module.exports = router;
