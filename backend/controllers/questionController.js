const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");

/**
 * Finds the user's weakest topic (lowest accuracy, min 2 attempts) from
 * their submission history. Pure aggregation-based — no external AI.
 */
async function findWeakestTopic(userId) {
  const stats = await Submission.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$topic",
        attempts: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ["$status", "Passed"] }, 1, 0] } },
      },
    },
    { $match: { attempts: { $gte: 2 } } },
    { $project: { topic: "$_id", accuracy: { $divide: ["$passed", "$attempts"] } } },
    { $sort: { accuracy: 1 } },
    { $limit: 1 },
  ]);
  return stats[0]?.topic || null;
}

// GET /api/questions/next  (adaptive: picks a question at the user's current level)
// If ?adaptive=true and no topic is specified, targets the user's weakest topic.
const getNextQuestion = async (req, res) => {
  try {
    const level = req.user.currentLevel;
    let topic = req.query.topic; // optional explicit filter

    if (!topic && req.query.adaptive === "true") {
      topic = await findWeakestTopic(req.user._id);
    }

    const filter = { difficulty: level };
    if (topic) filter.topic = topic;

    let count = await Question.countDocuments(filter);
    if (count === 0 && topic) {
      // fall back to any topic at this level if the weak topic has no questions yet
      delete filter.topic;
      count = await Question.countDocuments(filter);
    }
    if (count === 0) {
      return res.status(404).json({ message: `No questions found for level ${level}` });
    }

    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter).skip(random);

    // Hide the expected outputs of hidden test cases from the client
    const safeQuestion = question.toObject();
    safeQuestion.testCases = safeQuestion.testCases.map((tc) =>
      tc.isHidden ? { isHidden: true } : tc
    );
    safeQuestion.targetedWeakTopic = topic && req.query.adaptive === "true" ? topic : null;

    res.json(safeQuestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/questions/:id
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const safeQuestion = question.toObject();
    safeQuestion.testCases = safeQuestion.testCases.map((tc) =>
      tc.isHidden ? { isHidden: true } : tc
    );
    res.json(safeQuestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/questions  (list, for browsing / admin)
const listQuestions = async (req, res) => {
  try {
    const { topic, difficulty, company } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.companyTags = company;

    const questions = await Question.find(filter).select("title topic difficulty companyTags");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/questions/companies/list — distinct companies with question counts, for Company-Wise Prep Sets
const listCompanies = async (req, res) => {
  try {
    const results = await Question.aggregate([
      { $unwind: "$companyTags" },
      { $group: { _id: "$companyTags", count: { $sum: 1 }, difficulties: { $addToSet: "$difficulty" } } },
      { $project: { company: "$_id", _id: 0, count: 1, difficulties: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/questions  (add a question to the bank)
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/questions/bookmarked/list — questions the user has bookmarked
const listBookmarked = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "bookmarkedQuestions",
      "title topic difficulty companyTags"
    );
    res.json(user.bookmarkedQuestions || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/questions/:id/bookmark — add/remove a question from the user's bookmarks
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const questionId = req.params.id;
    const alreadyBookmarked = user.bookmarkedQuestions.some(
      (id) => id.toString() === questionId
    );

    if (alreadyBookmarked) {
      user.bookmarkedQuestions = user.bookmarkedQuestions.filter(
        (id) => id.toString() !== questionId
      );
    } else {
      user.bookmarkedQuestions.push(questionId);
    }

    await user.save();
    res.json({ bookmarked: !alreadyBookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNextQuestion,
  getQuestionById,
  listQuestions,
  listCompanies,
  createQuestion,
  listBookmarked,
  toggleBookmark,
};
