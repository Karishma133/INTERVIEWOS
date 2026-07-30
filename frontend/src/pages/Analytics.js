import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { StatusBadge } from "../components/Cards";

function BarRow({ label, value, max, suffix = "%" }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-28 text-sm text-gray-600 dark:text-gray-300 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
        <div className="bg-primary-600 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-sm text-gray-500 dark:text-gray-400 text-right">{value}{suffix}</span>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.analyticsOverview().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="page-container"><p className="text-red-600">{error}</p></div>;
  if (!data) return <div className="page-container"><p className="text-gray-400">Loading analytics...</p></div>;

  return (
    <div className="page-container">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">Your Performance Analytics</h1>

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Overall</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.totalSubmissions} submissions</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.overallAccuracy}% accuracy</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Level: <span className="text-primary-600 font-semibold">{data.currentLevel}</span> · Score: <span className="text-primary-600 font-semibold">{data.performanceScore}</span>/100
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🟢 Strongest Topics</h3>
          {data.strongestTopics.length === 0 && <p className="text-sm text-gray-400">Solve a few more questions to see this.</p>}
          {data.strongestTopics.map((t) => <BarRow key={t.topic} label={t.topic} value={t.accuracy} max={100} />)}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🔴 Needs Focus</h3>
          {data.weakestTopics.length === 0 && <p className="text-sm text-gray-400">Solve a few more questions to see this.</p>}
          {data.weakestTopics.map((t) => <BarRow key={t.topic} label={t.topic} value={t.accuracy} max={100} />)}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Topic Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="py-2 pr-4">Topic</th><th className="py-2 pr-4">Attempts</th><th className="py-2 pr-4">Passed</th><th className="py-2 pr-4">Accuracy</th><th className="py-2">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {data.topicStats.map((t) => (
                <tr key={t.topic} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="py-2 pr-4 text-gray-700 dark:text-gray-200">{t.topic}</td>
                  <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{t.attempts}</td>
                  <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{t.passed}</td>
                  <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{t.accuracy}%</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400">{t.avgTimeMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Submissions</h3>
        <div className="space-y-2">
          {data.recent.map((s) => (
            <div key={s._id} className="flex items-center gap-2 text-sm py-1.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
              <StatusBadge status={s.status} />
              <span className="text-gray-700 dark:text-gray-200">{s.question?.title || s.topic}</span>
              <span className="text-gray-400">({s.topic}, {s.difficulty}) — {s.executionTimeMs}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
