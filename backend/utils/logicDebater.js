/**
 * logicDebater.js
 * -----------------------------------------------------------------------
 * "AI Voice Logic Debater — Challenge Without Changing Code"
 *
 * After a student's solution passes, instead of just moving to the next
 * question, the system challenges their THINKING — verbally — the way a
 * real interviewer follow-up would ("What if the input were huge?",
 * "Why didn't you use a hash map?"). The student must DEFEND their
 * existing solution out loud; they never touch the code again.
 *
 * How it works (fully rule-based, no external AI call):
 * 1. generateChallenges() inspects the already-computed code review
 *    (loop nesting, recursion, data structures used) and picks 1-2
 *    relevant "why did you..." / "what if..." challenge questions from a
 *    template bank, matched to what the code actually does.
 * 2. The frontend speaks the challenge aloud (Web Speech API) and
 *    records the student's spoken/typed defense.
 * 3. evaluateDefense() scores the response by checking for the presence
 *    of the CONCEPTS a strong answer would mention (keyword-concept
 *    matching, not exact phrasing) — e.g. a scalability challenge should
 *    be defended by mentioning complexity/hash maps/optimization, not by
 *    reciting a specific sentence.
 * -----------------------------------------------------------------------
 */

const CHALLENGE_BANK = {
  scalability: {
    question: "What if the input size grew to 10 million elements — would your current approach still run fast enough? Walk me through why or why not.",
    expectedConcepts: ["slow", "fast", "optimi", "hash", "map", "set", "o(n)", "linear", "complexity", "scale", "index", "loop"],
    trigger: (review) => review.loopNestingDepth >= 2,
  },
  alternative_approach: {
    question: "Could this have been solved with a different data structure — like a hash map, stack, or set? Why did you choose this approach instead?",
    expectedConcepts: ["hash", "map", "set", "stack", "queue", "tree", "trade-off", "tradeoff", "space", "memory", "simpler", "chose"],
    trigger: (review) => review.loopNestingDepth >= 1 && review.dataStructuresUsed.length === 0,
  },
  recursion_defense: {
    question: "Your solution uses recursion — what happens with very large or deeply nested input? Could that cause a stack overflow, and how would you handle it?",
    expectedConcepts: ["stack overflow", "iterative", "memoiz", "cache", "base case", "depth", "recursion", "convert", "loop"],
    trigger: (review) => review.isRecursive,
  },
  space_tradeoff: {
    question: "You used extra memory for a data structure here — can you explain the time-versus-space trade-off you made?",
    expectedConcepts: ["space", "memory", "trade-off", "tradeoff", "extra", "faster", "lookup", "o(1)", "o(n)"],
    trigger: (review) => review.dataStructuresUsed.length > 0,
  },
  edge_case: {
    question: "What edge cases could break your solution — for example an empty input, all duplicates, or negative numbers? How does your code handle them?",
    expectedConcepts: ["empty", "null", "duplicate", "negative", "zero", "edge", "boundary", "handle", "check"],
    trigger: () => true,
  },
};

function generateChallenges(codeReview, count = 2) {
  const priorityOrder = ["scalability", "recursion_defense", "alternative_approach", "space_tradeoff", "edge_case"];
  const selected = [];

  for (const key of priorityOrder) {
    if (selected.length >= count) break;
    const challenge = CHALLENGE_BANK[key];
    if (challenge.trigger(codeReview)) {
      selected.push({ type: key, question: challenge.question });
    }
  }

  return selected;
}

function evaluateDefense(challengeType, responseText) {
  const challenge = CHALLENGE_BANK[challengeType];
  if (!challenge) return { score: 0, feedback: ["Unknown challenge type."], matchedConcepts: [] };

  const lower = (responseText || "").toLowerCase();
  const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length;

  const matched = challenge.expectedConcepts.filter((c) => lower.includes(c));
  const coverage = matched.length / Math.min(4, challenge.expectedConcepts.length);

  let score = Math.round(Math.min(1, coverage) * 80);
  if (wordCount >= 20) score += 10;
  if (wordCount < 8) score = Math.min(score, 30);
  score = Math.max(0, Math.min(100, score));

  const feedback = [];
  if (score >= 75) feedback.push("Strong defense — you covered the key technical reasoning an interviewer looks for.");
  else if (score >= 45) feedback.push("Reasonable start, but try to be more specific about the technical trade-off involved.");
  else feedback.push("This defense needs more depth — mention the specific complexity/data-structure reasoning behind your choice.");

  if (wordCount < 15) feedback.push("Try to explain in a bit more detail — interviewers want to hear your full reasoning, not just a one-liner.");

  return { score, feedback, matchedConcepts: matched, wordCount };
}

module.exports = { generateChallenges, evaluateDefense, CHALLENGE_BANK };
