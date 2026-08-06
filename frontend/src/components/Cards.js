import React from "react";

/**
 * Clean & minimalist stat card for Dashboard.js numbers (Total Solved,
 * Current Streak, etc.)
 * - icon: small glowing icon, top-left
 * - label: small gray title
 * - value: large bold number
 * - trend: optional small green "+5 this week" style footer text
 */
export function StatCard({ label, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(99,102,241,0.35)]">
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
      {trend && (
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">↗ {trend}</p>
      )}
    </div>
  );
}

export function ScoreBadge({ score, label, max = 100 }) {
  const pct = (score / max) * 100;
  const color = pct >= 75
    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    : pct >= 50
    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${color} !text-base !px-3 !py-1 font-bold`}>{score}{max === 100 ? "%" : `/${max}`}</span>
      {label && <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>}
    </div>
  );
}

export function DifficultyBadge({ difficulty }) {
  const colors = {
    Easy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return <span className={`badge ${colors[difficulty] || "bg-gray-100 text-gray-600"}`}>{difficulty}</span>;
}

export function StatusBadge({ status }) {
  const colors = {
    Passed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    Failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Error: "bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200",
    Timeout: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };
  return <span className={`badge ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

const DIFFICULTY_COLORS = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

/**
 * Action-oriented DSA problem card for Questions.js.
 * - Header: title + difficulty badge
 * - Body: company tags as pills
 * - Footer: "Solve Now" button, right-aligned
 * - Outlined border that highlights to the brand color on hover
 */
export function ProblemCard({ question, onSolve, bookmarked, onToggleBookmark }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-primary-500 dark:hover:border-primary-500 transition-colors duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug pr-1">{question.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`badge ${DIFFICULTY_COLORS[question.difficulty] || "bg-gray-100 text-gray-600"}`}>
            {question.difficulty}
          </span>
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(question)}
              title={bookmarked ? "Remove bookmark" : "Save for later"}
              className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                bookmarked ? "text-garnet-500" : "text-gray-300 dark:text-gray-600 hover:text-garnet-400"
              }`}
            >
              {bookmarked ? "★" : "☆"}
            </button>
          )}
        </div>
      </div>

      <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mb-3">{question.topic}</span>

      {question.companyTags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {question.companyTags.map((c) => (
            <span key={c} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 text-xs">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => onSolve?.(question)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          Solve Now →
        </button>
      </div>
    </div>
  );
}

/**
 * Interactive session card for upcoming mock interviews / live collab
 * rooms on Dashboard.js.
 * - Top: small "Upcoming Interview" / "Live Collab" tag
 * - Middle: avatar + peer/interviewer name + date/time
 * - Bottom: full-width bright "Join Room" button
 */
export function SessionCard({ type = "Upcoming Interview", name, dateTimeLabel, onJoin }) {
  const isLive = type === "Live Collab";
  return (
    <div className={`rounded-xl p-5 border ${isLive ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30" : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"}`}>
      <span className={`badge !text-[11px] mb-3 ${isLive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
        {isLive ? "🟢 Live Collab" : "📅 Upcoming Interview"}
      </span>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold shrink-0">
          {name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{dateTimeLabel}</p>
        </div>
      </div>

      <button
        onClick={onJoin}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 text-sm transition-colors"
      >
        Join Room
      </button>
    </div>
  );
}