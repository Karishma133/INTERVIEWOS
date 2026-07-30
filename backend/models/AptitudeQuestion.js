const mongoose = require("mongoose");

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["Quantitative", "Logical", "Verbal"], required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: (v) => v.length === 4 },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AptitudeQuestion", aptitudeQuestionSchema);
