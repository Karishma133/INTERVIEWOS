// Mirrors backend/utils/badges.js BADGE_DEFINITIONS so the frontend can
// render a label without an extra API round-trip.
const BADGE_LABELS = {
  first_solve: "🎉 First Blood",
  solved_10: "🔟 10 Solved",
  solved_50: "🏆 50 Solved",
  solved_100: "💯 Century Club",
  streak_3: "🔥 3-Day Streak",
  streak_7: "🔥🔥 7-Day Streak",
  streak_30: "🔥🔥🔥 30-Day Streak",
  hard_solver: "💪 Hard Mode",
};

export function badgeLabel(id) {
  return BADGE_LABELS[id] || id;
}
