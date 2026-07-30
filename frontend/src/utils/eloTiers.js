const TIERS = [
  { min: 0, name: "Bronze", emoji: "🥉", classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  { min: 1000, name: "Silver", emoji: "⚪", classes: "bg-gray-200 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300" },
  { min: 1300, name: "Gold", emoji: "🥇", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  { min: 1600, name: "Platinum", emoji: "💎", classes: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { min: 1900, name: "Diamond", emoji: "🔷", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  { min: 2200, name: "Master", emoji: "👑", classes: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
];

export function getEloTier(rating) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (rating >= t.min) tier = t;
  }
  return tier;
}
