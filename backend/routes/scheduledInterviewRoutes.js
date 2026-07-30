const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createScheduledInterview, myScheduledInterviews, cancelScheduledInterview,
} = require("../controllers/scheduledInterviewController");

router.post("/", protect, createScheduledInterview);
router.get("/mine", protect, myScheduledInterviews);
router.put("/:id/cancel", protect, cancelScheduledInterview);

module.exports = router;
