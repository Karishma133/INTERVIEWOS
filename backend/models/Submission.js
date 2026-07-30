const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    language: { type: String, enum: ["javascript", "python"], default: "javascript" },

    code: { type: String, required: true },

    status: {
      type: String,
      enum: ["Passed", "Failed", "Error", "Timeout"],
      required: true,
    },

    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },

    executionTimeMs: { type: Number, default: 0 },
    memoryUsedKB: { type: Number, default: 0 },

    errorMessage: { type: String, default: "" },
    feedback: { type: [String], default: [] }, // rule-based feedback messages

    // Smart proctoring signals (captured client-side, informational only)
    tabSwitchCount: { type: Number, default: 0 },
    pasteAttempts: { type: Number, default: 0 },

    // Deep Adaptive Learning signals
    timeTakenSec: { type: Number, default: 0 }, // think-time from question load to submit
    attemptNumber: { type: Number, default: 1 }, // 1 = first try on this question
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
