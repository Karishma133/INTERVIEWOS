import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Roadmap() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.roadmap().then(setData); }, []);

  if (!data) return <div className="page-container"><p className="text-gray-400">Loading roadmap...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">🧭 Your Personalized Roadmap</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Ranked by a weakness score combining accuracy, solving speed, and attempts-to-pass — based on {data.basedOnSubmissions} submissions.
      </p>

      {data.roadmap.length === 0 ? (
        <p className="text-gray-400">Solve a few problems across different topics to unlock your roadmap.</p>
      ) : (
        <div className="space-y-3">
          {data.roadmap.map((r, i) => (
            <div key={r.topic} className="card flex items-start gap-4">
              <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                i === 0 ? "bg-red-100 text-red-700" : i === 1 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.topic}</h3>
                  <span className="text-xs text-gray-400">Weakness score: {r.weaknessScore}/100</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.reason}</p>
              </div>
              <button
                onClick={() => navigate(`/questions?topic=${r.topic}`)}
                className="btn-secondary !py-1.5 !px-3 !text-sm shrink-0"
              >
                Practice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
