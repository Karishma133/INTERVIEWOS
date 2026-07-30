const SituationalQuestion = require("../models/SituationalQuestion");
const BehavioralAssessment = require("../models/BehavioralAssessment");

// GET /api/situational/quiz?count=5
const getQuiz = async (req, res) => {
  try {
    const count = Number(req.query.count) || 5;
    const questions = await SituationalQuestion.aggregate([{ $sample: { size: count } }]);

    const safe = questions.map((q) => ({
      _id: q._id,
      category: q.category,
      scenario: q.scenario,
      options: q.options.map((o, i) => ({ index: i, text: o.text })),
    }));

    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/situational/submit  { answers: [{ questionId, selectedIndex }] }
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await SituationalQuestion.find({ _id: { $in: questionIds } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let totalEffectiveness = 0;
    let maxPossible = 0;
    const results = answers.map((a) => {
      const q = qMap.get(a.questionId);
      if (!q) return null;
      const chosen = q.options[a.selectedIndex];
      const best = Math.max(...q.options.map((o) => o.effectiveness));
      totalEffectiveness += chosen ? chosen.effectiveness : 0;
      maxPossible += best;

      return {
        questionId: a.questionId,
        scenario: q.scenario,
        chosenText: chosen?.text,
        effectiveness: chosen?.effectiveness || 0,
        bestPossible: best,
        wasOptimal: chosen?.effectiveness === best,
        explanation: q.bestOptionExplanation,
      };
    }).filter(Boolean);

    const scorePercent = maxPossible ? Math.round((totalEffectiveness / maxPossible) * 100) : 0;

    await BehavioralAssessment.create({
      user: req.user._id,
      type: "situational_judgment",
      score: scorePercent,
      meta: { questionCount: answers.length },
    });

    res.json({ scorePercent, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getQuiz, submitQuiz };
