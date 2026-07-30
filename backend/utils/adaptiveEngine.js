/**
 * adaptiveEngine.js
 * -----------------------------------------------------------------------
 * Rule-based "AI Interviewer" logic — no external API calls.
 *
 * 1. updatePerformanceScore(): adjusts a user's rolling 0-100 score after
 *    every submission based on: pass/fail, execution speed, think-time
 *    (relative to a difficulty-based "par" time), and attempt count.
 * 2. decideNextLevel(): simple threshold rules move the user between
 *    Easy / Medium / Hard.
 * 3. generateFeedback(): maps common failure signatures to plain-English
 *    coaching tips (a lookup table, not an LLM).
 * 4. generateRoadmap(): "Deep Adaptive Learning" — ranks topics by a
 *    composite weakness score (accuracy, speed, attempts-to-pass) and
 *    returns a prioritized, explained study order.
 * -----------------------------------------------------------------------
 */

const LEVEL_ORDER = ["Easy", "Medium", "Hard"];

// Expected/"par" think-time in seconds per difficulty — used to judge
// solving speed the way a real interviewer would (relative to problem
// difficulty, not an absolute number).
const PAR_TIME_SEC = { Easy: 600, Medium: 1200, Hard: 1800 };

function updatePerformanceScore(currentScore, { status, executionTimeMs, difficulty, timeTakenSec, attemptNumber }) {
  let delta = 0;

  if (status === "Passed") {
    delta += difficulty === "Hard" ? 12 : difficulty === "Medium" ? 8 : 5;
    if (executionTimeMs < 50) delta += 3; // fast & efficient code bonus

    // Think-time relative to par (Deep Adaptive Learning signal)
    if (typeof timeTakenSec === "number" && PAR_TIME_SEC[difficulty]) {
      const ratio = timeTakenSec / PAR_TIME_SEC[difficulty];
      if (ratio <= 0.5) delta += 4; // solved well under par time
      else if (ratio > 1.5) delta -= 2; // took much longer than par
    }

    // First-attempt bonus vs. many-attempts penalty
    if (attemptNumber === 1) delta += 2;
    else if (attemptNumber >= 4) delta -= 3;
  } else if (status === "Failed") {
    delta -= 4;
  } else if (status === "Timeout") {
    delta -= 6; // likely inefficient / infinite loop
  } else if (status === "Error") {
    delta -= 3;
  }

  const next = Math.max(0, Math.min(100, currentScore + delta));
  return next;
}

function decideNextLevel(currentLevel, performanceScore) {
  const idx = LEVEL_ORDER.indexOf(currentLevel);

  if (performanceScore >= 75 && idx < LEVEL_ORDER.length - 1) {
    return LEVEL_ORDER[idx + 1]; // level up
  }
  if (performanceScore <= 25 && idx > 0) {
    return LEVEL_ORDER[idx - 1]; // level down
  }
  return currentLevel; // stay
}

function generateFeedback({ status, executionTimeMs, memoryUsedKB, errorMessage, testCasesPassed, totalTestCases }) {
  const tips = [];

  if (status === "Timeout") {
    tips.push("Execution timed out. Check for infinite loops or a recursive call missing a base case.");
    tips.push("Consider whether your approach's time complexity is too high for the input size (e.g. nested loops -> O(n^2)).");
  }

  if (status === "Error") {
    tips.push(`Runtime error: ${errorMessage || "unknown error"}. Check variable names, types, and array bounds.`);
  }

  if (status === "Failed" && testCasesPassed < totalTestCases) {
    tips.push(`Passed ${testCasesPassed}/${totalTestCases} test cases. Re-check edge cases like empty input, negative numbers, or duplicates.`);
  }

  if (status === "Passed") {
    if (executionTimeMs > 200) {
      tips.push("Correct, but execution time is high. Try optimizing loops or using a hash map to avoid repeated scans.");
    }
    if (memoryUsedKB > 50000) {
      tips.push("Correct, but memory usage is high. Avoid creating unnecessary large arrays or copies of data.");
    }
    if (tips.length === 0) {
      tips.push("Great job — solved correctly with good time and memory usage!");
    }
  }

  return tips;
}

/**
 * "Deep Adaptive Learning" roadmap: given per-topic stats
 * [{ topic, attempts, passed, accuracy, avgTimeTakenSec, avgAttemptsToPass }],
 * ranks topics by a composite weakness score and returns a study-order
 * roadmap with the reasoning behind each recommendation.
 */
function generateRoadmap(topicStats) {
  const scored = topicStats
    .filter((t) => t.attempts >= 1)
    .map((t) => {
      const accuracyGap = 100 - (t.accuracy || 0); // higher = weaker
      const parSec = PAR_TIME_SEC[t.dominantDifficulty] || 1200;
      const speedGap = t.avgTimeTakenSec ? Math.max(0, (t.avgTimeTakenSec - parSec) / parSec) * 100 : 0;
      const attemptsGap = Math.min(100, (t.avgAttemptsToPass || 1) * 15);

      const weaknessScore = Math.round(accuracyGap * 0.5 + speedGap * 0.3 + attemptsGap * 0.2);

      const reasons = [];
      if (accuracyGap > 40) reasons.push(`only ${t.accuracy}% accuracy`);
      if (speedGap > 30) reasons.push("solving noticeably slower than expected pace");
      if (attemptsGap > 30) reasons.push("often needs multiple attempts to pass");
      if (reasons.length === 0) reasons.push("solid performance — light review recommended");

      return { topic: t.topic, weaknessScore, accuracy: t.accuracy, reason: reasons.join(", ") };
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore);

  return scored;
}

module.exports = { updatePerformanceScore, decideNextLevel, generateFeedback, generateRoadmap, PAR_TIME_SEC };
