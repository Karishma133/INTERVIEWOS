const User = require("../models/User");
const { getTier } = require("../utils/eloEngine");

// GET /api/leaderboard?sortBy=performanceScore|totalSolved|currentStreak|eloRating
const getLeaderboard = async (req, res) => {
  try {
    const sortBy = ["performanceScore", "totalSolved", "currentStreak", "eloRating"].includes(req.query.sortBy)
      ? req.query.sortBy
      : "eloRating";

    const users = await User.find()
      .select("name performanceScore totalSolved currentStreak longestStreak currentLevel badges eloRating")
      .sort({ [sortBy]: -1 })
      .limit(50);

    const ranked = users.map((u, i) => {
      const obj = u.toObject();
      const tier = getTier(obj.eloRating);
      return { rank: i + 1, ...obj, eloTier: tier.name, eloTierColor: tier.color };
    });
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLeaderboard };
