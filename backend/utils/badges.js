/**
 * badges.js — rule-based gamification engine (streaks + milestones).
 */

const BADGE_DEFINITIONS = [
  { id: "first_solve", label: "🎉 First Blood", check: (u) => u.totalSolved >= 1 },
  { id: "solved_10", label: "🔟 10 Solved", check: (u) => u.totalSolved >= 10 },
  { id: "solved_50", label: "🏆 50 Solved", check: (u) => u.totalSolved >= 50 },
  { id: "solved_100", label: "💯 Century Club", check: (u) => u.totalSolved >= 100 },
  { id: "streak_3", label: "🔥 3-Day Streak", check: (u) => u.currentStreak >= 3 },
  { id: "streak_7", label: "🔥🔥 7-Day Streak", check: (u) => u.currentStreak >= 7 },
  { id: "streak_30", label: "🔥🔥🔥 30-Day Streak", check: (u) => u.currentStreak >= 30 },
  { id: "hard_solver", label: "💪 Hard Mode", check: (u) => u.currentLevel === "Hard" },
];

/** Computes today's date + yesterday's date as YYYY-MM-DD strings (server-local). */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Updates a user's streak/totalSolved counters after a PASSED submission.
 * Mutates and returns the user document fields (caller must .save()).
 */
function updateStreakAndSolved(user) {
  const today = todayStr();
  if (user.lastSolvedDate === today) {
    // Already counted today — just bump totalSolved
    user.totalSolved += 1;
    return user;
  }

  if (user.lastSolvedDate === yesterdayStr()) {
    user.currentStreak += 1;
  } else {
    user.currentStreak = 1; // streak broken or first ever solve
  }

  user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  user.lastSolvedDate = today;
  user.totalSolved += 1;
  return user;
}

/** Returns newly earned badge ids (not yet in user.badges) after checking all definitions. */
function checkNewBadges(user) {
  const earned = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (!user.badges.includes(badge.id) && badge.check(user)) {
      earned.push(badge.id);
    }
  }
  return earned;
}

function badgeLabel(id) {
  return BADGE_DEFINITIONS.find((b) => b.id === id)?.label || id;
}

module.exports = { BADGE_DEFINITIONS, updateStreakAndSolved, checkNewBadges, badgeLabel };
