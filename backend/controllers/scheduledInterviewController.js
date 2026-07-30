const crypto = require("crypto");
const ScheduledInterview = require("../models/ScheduledInterview");

// POST /api/scheduled-interviews  { scheduledAt, interviewerName, topic }
const createScheduledInterview = async (req, res) => {
  try {
    const { scheduledAt, interviewerName, topic } = req.body;
    if (!scheduledAt) return res.status(400).json({ message: "scheduledAt is required" });

    const interview = await ScheduledInterview.create({
      user: req.user._id,
      scheduledAt,
      interviewerName: interviewerName || "AI Interviewer",
      topic: topic || "General DSA",
      roomId: crypto.randomBytes(4).toString("hex"),
    });
    res.status(201).json(interview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/scheduled-interviews/mine
const myScheduledInterviews = async (req, res) => {
  const interviews = await ScheduledInterview.find({ user: req.user._id, status: "Upcoming" }).sort({ scheduledAt: 1 });
  res.json(interviews);
};

// PUT /api/scheduled-interviews/:id/cancel
const cancelScheduledInterview = async (req, res) => {
  const interview = await ScheduledInterview.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: "Cancelled" },
    { new: true }
  );
  if (!interview) return res.status(404).json({ message: "Interview not found" });
  res.json(interview);
};

module.exports = { createScheduledInterview, myScheduledInterviews, cancelScheduledInterview };
