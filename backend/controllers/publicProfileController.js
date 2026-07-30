const User = require("../models/User");
const Submission = require("../models/Submission");
const { getTier } = require("../utils/eloEngine");

// GET /api/public/:slug — no auth required
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ publicSlug: req.params.slug })
      .select("name currentLevel performanceScore totalSolved currentStreak longestStreak badges createdAt techStack publicSlug eloRating");
    if (!user) return res.status(404).json({ message: "Profile not found" });

    const topicStats = await Submission.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: "$topic",
          attempts: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ["$status", "Passed"] }, 1, 0] } },
        },
      },
      { $project: { topic: "$_id", _id: 0, attempts: 1, passed: 1, accuracy: { $round: [{ $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] }, 0] } } },
      { $sort: { attempts: -1 } },
    ]);

    const tier = getTier(user.eloRating);
    res.json({ ...user.toObject(), topicStats, eloTier: tier.name, eloTierColor: tier.color });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicProfile };
