const mongoose = require("mongoose");

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: ["Quantitative", "Logical", "Verbal", "Mixed"], required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    scorePercent: { type: Number, required: true },
    timeTakenSec: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AptitudeAttempt", aptitudeAttemptSchema);
