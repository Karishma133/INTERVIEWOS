const AptitudeQuestion = require("../models/AptitudeQuestion");
const AptitudeAttempt = require("../models/AptitudeAttempt");

// GET /api/aptitude/quiz?category=Quantitative&count=10
const getQuiz = async (req, res) => {
  try {
    const { category, count = 10 } = req.query;
    const filter = category && category !== "Mixed" ? { category } : {};

    const questions = await AptitudeQuestion.aggregate([
      { $match: filter },
      { $sample: { size: Number(count) } },
      { $project: { question: 1, options: 1, category: 1, difficulty: 1 } },
    ]);

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/aptitude/submit  { answers: [{ questionId, selectedIndex }], category, timeTakenSec }
const submitQuiz = async (req, res) => {
  try {
    const { answers, category = "Mixed", timeTakenSec = 0 } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await AptitudeQuestion.find({ _id: { $in: questionIds } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    const results = answers.map((a) => {
      const q = qMap.get(a.questionId);
      const isCorrect = q && q.correctIndex === a.selectedIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        question: q?.question,
        selectedIndex: a.selectedIndex,
        correctIndex: q?.correctIndex,
        isCorrect,
        explanation: q?.explanation,
      };
    });

    const scorePercent = Math.round((correctCount / answers.length) * 100);

    await AptitudeAttempt.create({
      user: req.user._id,
      category,
      totalQuestions: answers.length,
      correctCount,
      scorePercent,
      timeTakenSec,
    });

    res.json({ correctCount, totalQuestions: answers.length, scorePercent, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/aptitude/history
const getHistory = async (req, res) => {
  const attempts = await AptitudeAttempt.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json(attempts);
};

module.exports = { getQuiz, submitQuiz, getHistory };
