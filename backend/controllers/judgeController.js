const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { runCode } = require("../utils/codeRunner");
const { updatePerformanceScore, decideNextLevel, generateFeedback, generateRoadmap } = require("../utils/adaptiveEngine");
const { reviewCode } = require("../utils/codeHints");
const { updateStreakAndSolved, checkNewBadges, badgeLabel } = require("../utils/badges");
const { updateElo, getTier } = require("../utils/eloEngine");

// POST /api/judge/submit  { questionId, code, language, timeTakenSec }
const submitCode = async (req, res) => {
  try {
    const { questionId, code, language = "javascript", tabSwitchCount = 0, pasteAttempts = 0, timeTakenSec = 0 } = req.body;
    if (!questionId || !code) {
      return res.status(400).json({ message: "questionId and code are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Deep Adaptive Learning: how many times has this user already
    // attempted this exact question?
    const priorAttempts = await Submission.countDocuments({ user: req.user._id, question: question._id });
    const attemptNumber = priorAttempts + 1;

    const result = await runCode({
      code,
      functionName: question.functionName,
      testCases: question.testCases,
      language,
    });

    const feedback = generateFeedback({
      status: result.status,
      executionTimeMs: result.executionTimeMs,
      memoryUsedKB: result.memoryUsedKB,
      errorMessage: result.errorMessage,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
    });

    // "AI Code Review" — algorithmic static analysis, not an external API call
    const codeReview = language === "javascript" ? reviewCode(code, question.functionName) : null;

    // Save submission (for analytics dashboard)
    const submission = await Submission.create({
      user: req.user._id,
      question: question._id,
      topic: question.topic,
      difficulty: question.difficulty,
      language,
      code,
      status: result.status,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
      executionTimeMs: result.executionTimeMs,
      memoryUsedKB: result.memoryUsedKB,
      errorMessage: result.errorMessage,
      feedback,
      tabSwitchCount,
      pasteAttempts,
      timeTakenSec,
      attemptNumber,
    });

    // Update user's adaptive score + level (the "AI Interviewer" logic)
    const user = await User.findById(req.user._id);
    const previousLevel = user.currentLevel;
    const newScore = updatePerformanceScore(user.performanceScore, {
      status: result.status,
      executionTimeMs: result.executionTimeMs,
      difficulty: question.difficulty,
      timeTakenSec,
      attemptNumber,
    });
    const newLevel = decideNextLevel(previousLevel, newScore);

    user.performanceScore = newScore;
    user.currentLevel = newLevel;

    // Gamification: streak + total solved + badges, only on a full pass
    let newBadges = [];
    if (result.status === "Passed") {
      updateStreakAndSolved(user);
      newBadges = checkNewBadges(user);
      user.badges.push(...newBadges);
    }

    // Global Developer Elo Rating
    const previousElo = user.eloRating;
    user.eloRating = updateElo(user.eloRating, {
      status: result.status,
      difficulty: question.difficulty,
      attemptNumber,
    });
    await user.save();

    // Only reveal hidden test case results as pass/fail, not their expected output
    const publicResults = result.perTestResults.map((r) => ({
      index: r.index,
      passed: r.passed,
      isHidden: r.isHidden,
      actual: r.isHidden ? undefined : r.actual,
      error: r.error,
      timeMs: r.timeMs,
    }));

    res.json({
      status: result.status,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
      executionTimeMs: result.executionTimeMs,
      memoryUsedKB: result.memoryUsedKB,
      feedback,
      codeReview,
      perTestResults: publicResults,
      submissionId: submission._id,
      updatedLevel: newLevel,
      updatedScore: newScore,
      leveledUp: newLevel !== previousLevel,
      currentStreak: user.currentStreak,
      totalSolved: user.totalSolved,
      newBadges: newBadges.map((id) => ({ id, label: badgeLabel(id) })),
      eloRating: user.eloRating,
      eloChange: user.eloRating - previousElo,
      eloTier: getTier(user.eloRating).name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitCode };
