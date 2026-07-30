const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    effectiveness: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const situationalQuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Crisis Management", "Leadership", "Teamwork", "Communication", "Ethics"],
      required: true,
    },
    scenario: { type: String, required: true },
    options: { type: [optionSchema], required: true, validate: (v) => v.length >= 3 },
    bestOptionExplanation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SituationalQuestion", situationalQuestionSchema);
