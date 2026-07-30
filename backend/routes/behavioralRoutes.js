const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { recordAssessment, getRadarData } = require("../controllers/behavioralController");

router.post("/record", protect, recordAssessment);
router.get("/radar", protect, getRadarData);

module.exports = router;
