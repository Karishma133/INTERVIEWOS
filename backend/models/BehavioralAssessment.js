const mongoose = require("mongoose");

const behavioralAssessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["voice_interview", "logic_debate", "situational_judgment"], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BehavioralAssessment", behavioralAssessmentSchema);
