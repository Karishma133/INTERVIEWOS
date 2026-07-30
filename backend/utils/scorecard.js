/**
 * scorecard.js — generates an "Automated Rubric & Scorecard" from a
 * user's submission history. Rule-based aggregation, no external AI.
 *
 * Dimensions scored (0-100 each):
 * - Problem Solving: overall pass rate
 * - Code Cleanliness: inverse of flagged anti-pattern frequency
 * - Efficiency: how often passed submissions ran fast
 * - Edge Case Handling: average % of test cases passed per submission
 */

function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function generateScorecard(submissions) {
  if (submissions.length === 0) {
    return {
      problemSolving: 0, codeCleanliness: 0, efficiency: 0, edgeCaseHandling: 0,
      overall: 0, totalSubmissions: 0, strengths: [], improvements: ["Solve a few problems to generate a scorecard."],
    };
  }

  const passRate = submissions.filter((s) => s.status === "Passed").length / submissions.length;
  const problemSolving = Math.round(passRate * 100);

  const edgeCaseRatios = submissions.map((s) => (s.totalTestCases ? s.testCasesPassed / s.totalTestCases : 0));
  const edgeCaseHandling = Math.round(average(edgeCaseRatios) * 100);

  const passed = submissions.filter((s) => s.status === "Passed");
  const fastPassed = passed.filter((s) => s.executionTimeMs < 50).length;
  const efficiency = passed.length ? Math.round((fastPassed / passed.length) * 100) : 50;

  const flaggedCount = submissions.filter((s) => (s.feedback || []).some((f) => /complexity|inefficient|memoization|nested/i.test(f))).length;
  const codeCleanliness = Math.max(0, 100 - Math.round((flaggedCount / submissions.length) * 100));

  const overall = Math.round(
    problemSolving * 0.4 + edgeCaseHandling * 0.25 + efficiency * 0.2 + codeCleanliness * 0.15
  );

  const strengths = [];
  const improvements = [];
  if (problemSolving >= 70) strengths.push("Strong problem-solving accuracy");
  else improvements.push("Focus on correctness — review failed submissions for logic gaps");
  if (edgeCaseHandling >= 80) strengths.push("Handles edge cases well");
  else improvements.push("Test more edge cases (empty input, duplicates, negative numbers) before submitting");
  if (efficiency >= 60) strengths.push("Generally efficient solutions");
  else improvements.push("Work on optimizing time complexity — review the Code Review hints on your submissions");
  if (codeCleanliness >= 80) strengths.push("Clean, well-structured code");
  else improvements.push("Reduce anti-patterns flagged in code review (nested loops, missing memoization)");

  return {
    problemSolving, codeCleanliness, efficiency, edgeCaseHandling, overall,
    totalSubmissions: submissions.length,
    strengths, improvements,
  };
}

module.exports = { generateScorecard };
