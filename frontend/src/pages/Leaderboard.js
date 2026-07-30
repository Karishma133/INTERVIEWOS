import React, { useEffect, useState } from "react";
import { api, getCurrentUser } from "../services/api";
import { badgeLabel } from "../utils/badgeLabels";

const SORT_OPTIONS = [
  { key: "eloRating", label: "Elo Rating" },
  { key: "performanceScore", label: "Score" },
  { key: "totalSolved", label: "Problems Solved" },
  { key: "currentStreak", label: "Streak" },
];

export default function Leaderboard() {
  const currentUser = getCurrentUser();
  const [sortBy, setSortBy] = useState("eloRating");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.leaderboard(sortBy).then(setUsers).finally(() => setLoading(false));
  }, [sortBy]);

  const medal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">🏆 Global Leaderboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Top performers on InterviewOS — Elo rating rewards consistently solving harder problems.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setSortBy(o.key)}
            className={`badge cursor-pointer !text-sm ${sortBy === o.key ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading leaderboard...</p>
      ) : (
        <div className="card !p-0 divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((u) => (
            <div
              key={u._id}
              className={`flex items-center gap-4 px-5 py-3 ${u._id === currentUser?._id ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}
            >
              <span className="w-10 text-lg font-bold text-center text-gray-500 dark:text-gray-400">{medal(u.rank)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                  <span className="badge !text-[10px] bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                    {u.eloTier} · {u.eloRating}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {u.totalSolved} solved · {u.currentStreak}🔥 streak · Level {u.currentLevel}
                </p>
              </div>
              <div className="flex gap-1">
                {u.badges?.slice(0, 3).map((id) => (
                  <span key={id} title={badgeLabel(id)} className="text-lg">{badgeLabel(id).split(" ")[0]}</span>
                ))}
              </div>
              <span className="font-bold text-primary-600 w-14 text-right">{u[sortBy]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
