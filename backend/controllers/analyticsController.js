const Submission = require("../models/Submission");
const mongoose = require("mongoose");
const { generateScorecard } = require("../utils/scorecard");
const { generateRoadmap } = require("../utils/adaptiveEngine");

// GET /api/analytics/overview
const getOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const totalSubmissions = await Submission.countDocuments({ user: userId });
    const passedSubmissions = await Submission.countDocuments({ user: userId, status: "Passed" });

    // Per-topic breakdown: total attempts, passed, avg time, avg memory
    const topicStats = await Submission.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$topic",
          attempts: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ["$status", "Passed"] }, 1, 0] } },
          timeouts: { $sum: { $cond: [{ $eq: ["$status", "Timeout"] }, 1, 0] } },
          avgTimeMs: { $avg: "$executionTimeMs" },
          avgMemoryKB: { $avg: "$memoryUsedKB" },
        },
      },
      {
        $project: {
          topic: "$_id",
          _id: 0,
          attempts: 1,
          passed: 1,
          timeouts: 1,
          accuracy: { $round: [{ $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] }, 1] },
          avgTimeMs: { $round: ["$avgTimeMs", 1] },
          avgMemoryKB: { $round: ["$avgMemoryKB", 1] },
        },
      },
      { $sort: { accuracy: 1 } }, // weakest topics first
    ]);

    // Recent submissions timeline (last 20)
    const recent = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("question", "title")
      .select("topic difficulty status executionTimeMs createdAt question");

    const weakestTopics = topicStats.filter((t) => t.attempts >= 2).slice(0, 3);
    const strongestTopics = [...topicStats]
      .filter((t) => t.attempts >= 2)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    res.json({
      totalSubmissions,
      passedSubmissions,
      overallAccuracy: totalSubmissions
        ? Number(((passedSubmissions / totalSubmissions) * 100).toFixed(1))
        : 0,
      currentLevel: req.user.currentLevel,
      performanceScore: req.user.performanceScore,
      topicStats,
      weakestTopics,
      strongestTopics,
      recent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/scorecard — "Automated Rubric & Scorecard"
const getScorecard = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .select("status testCasesPassed totalTestCases executionTimeMs feedback");
    res.json(generateScorecard(submissions));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOverview, getScorecard, getRoadmap };

// GET /api/analytics/roadmap — "Deep Adaptive Learning Engine" roadmap
async function getRoadmap(req, res) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await Submission.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$topic",
          attempts: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ["$status", "Passed"] }, 1, 0] } },
          avgTimeTakenSec: { $avg: "$timeTakenSec" },
          avgAttemptsToPass: { $avg: "$attemptNumber" },
          difficulties: { $push: "$difficulty" },
        },
      },
      {
        $project: {
          topic: "$_id", _id: 0, attempts: 1, passed: 1,
          accuracy: { $round: [{ $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] }, 0] },
          avgTimeTakenSec: { $round: ["$avgTimeTakenSec", 0] },
          avgAttemptsToPass: { $round: ["$avgAttemptsToPass", 1] },
          dominantDifficulty: { $arrayElemAt: ["$difficulties", 0] },
        },
      },
    ]);

    const roadmap = generateRoadmap(stats);
    res.json({ roadmap, basedOnSubmissions: stats.reduce((sum, s) => sum + s.attempts, 0) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
