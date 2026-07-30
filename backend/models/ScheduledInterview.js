const mongoose = require("mongoose");

const scheduledInterviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    interviewerName: { type: String, default: "AI Interviewer" },
    topic: { type: String, default: "General DSA" },
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Upcoming", "Completed", "Cancelled"], default: "Upcoming" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScheduledInterview", scheduledInterviewSchema);
