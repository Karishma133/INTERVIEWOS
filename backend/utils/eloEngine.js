/**
 * eloEngine.js — "Global Developer Elo Rating"
 * -----------------------------------------------------------------------
 * A standard chess-style Elo rating system, applied to DSA problem
 * solving. Each difficulty level acts as a fixed "opponent rating";
 * solving it moves your rating toward/away from that anchor the same
 * way beating/losing to an opponent of a given rating would.
 * -----------------------------------------------------------------------
 */

const DIFFICULTY_OPPONENT_RATING = { Easy: 1000, Medium: 1300, Hard: 1650 };
const K_FACTOR = 32;

const TIERS = [
  { min: 0, name: "Bronze", color: "#b45309" },
  { min: 1000, name: "Silver", color: "#6b7280" },
  { min: 1300, name: "Gold", color: "#d97706" },
  { min: 1600, name: "Platinum", color: "#0891b2" },
  { min: 1900, name: "Diamond", color: "#7c3aed" },
  { min: 2200, name: "Master", color: "#dc2626" },
];

function expectedScore(userRating, opponentRating) {
  return 1 / (1 + Math.pow(10, (opponentRating - userRating) / 400));
}

function updateElo(currentRating, { status, difficulty, attemptNumber = 1 }) {
  if (status !== "Passed") return currentRating;

  const opponentRating = DIFFICULTY_OPPONENT_RATING[difficulty] || 1200;
  const expected = expectedScore(currentRating, opponentRating);
  const actual = Math.max(0.6, 1 - (attemptNumber - 1) * 0.1);

  const delta = Math.round(K_FACTOR * (actual - expected));
  return Math.max(400, currentRating + delta);
}

function getTier(rating) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (rating >= t.min) tier = t;
  }
  return tier;
}

module.exports = { updateElo, getTier, DIFFICULTY_OPPONENT_RATING, TIERS };
