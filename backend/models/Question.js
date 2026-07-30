const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: mongoose.Schema.Types.Mixed, required: true }, // args array, e.g. [[1,2,3], 5]
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    isHidden: { type: Boolean, default: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    topic: {
      type: String,
      required: true,
      enum: [
        "Array",
        "String",
        "LinkedList",
        "Stack",
        "Queue",
        "Tree",
        "Graph",
        "DynamicProgramming",
        "Recursion",
        "Sorting",
        "Searching",
        "HashMap",
        "Greedy",
      ],
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    companyTags: { type: [String], default: [] }, // e.g. ["Google", "Amazon"]

    // The user's function must be named exactly this, e.g. "solve"
    functionName: { type: String, required: true, default: "solve" },

    starterCode: { type: String, default: "function solve() {\n  // your code here\n}" },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    testCases: { type: [testCaseSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
