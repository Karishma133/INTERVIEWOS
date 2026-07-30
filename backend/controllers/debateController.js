const { reviewCode } = require("../utils/codeHints");
const { generateChallenges, evaluateDefense } = require("../utils/logicDebater");

// POST /api/debate/challenge  { code, functionName }
const getChallenges = async (req, res) => {
  try {
    const { code, functionName = "solve" } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    const review = reviewCode(code, functionName);
    const challenges = generateChallenges(review);
    res.json({ challenges, codeReview: review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/debate/evaluate  { challengeType, responseText }
const submitDefense = async (req, res) => {
  try {
    const { challengeType, responseText } = req.body;
    if (!challengeType || !responseText) {
      return res.status(400).json({ message: "challengeType and responseText are required" });
    }
    const result = evaluateDefense(challengeType, responseText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getChallenges, submitDefense };
