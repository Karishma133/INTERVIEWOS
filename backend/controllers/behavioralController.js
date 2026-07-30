const BehavioralAssessment = require("../models/BehavioralAssessment");

// POST /api/behavioral/record  { type, score, meta }
const recordAssessment = async (req, res) => {
  try {
    const { type, score, meta } = req.body;
    if (!type || typeof score !== "number") {
      return res.status(400).json({ message: "type and score are required" });
    }
    const record = await BehavioralAssessment.create({ user: req.user._id, type, score, meta });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/behavioral/radar — average score per assessment type, for the Scorecard radar chart
const getRadarData = async (req, res) => {
  try {
    const results = await BehavioralAssessment.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$type", avgScore: { $avg: "$score" }, count: { $sum: 1 } } },
    ]);

    const byType = Object.fromEntries(results.map((r) => [r._id, { score: Math.round(r.avgScore), count: r.count }]));

    res.json({
      communication: byType.voice_interview || { score: null, count: 0 },
      composure: byType.logic_debate || { score: null, count: 0 },
      judgment: byType.situational_judgment || { score: null, count: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { recordAssessment, getRadarData };
