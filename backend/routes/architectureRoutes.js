const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { reviewBoard } = require("../controllers/architectureController");

router.post("/review", protect, reviewBoard);

module.exports = router;
