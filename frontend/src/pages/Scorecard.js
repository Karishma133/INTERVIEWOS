import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import RadarChart from "../components/RadarChart";

function ScoreBar({ label, value }) {
  const color = value >= 75 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{value}/100</span>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Scorecard() {
  const [data, setData] = useState(null);
  const [radar, setRadar] = useState(null);

  useEffect(() => {
    api.scorecard().then(setData);
    api.getRadarData().then(setRadar);
  }, []);

  if (!data) return <div className="page-container"><p className="text-gray-400">Loading scorecard...</p></div>;

  const radarData = [
    { label: "Problem Solving", value: data.problemSolving },
    { label: "Edge Cases", value: data.edgeCaseHandling },
    { label: "Efficiency", value: data.efficiency },
    { label: "Cleanliness", value: data.codeCleanliness },
    { label: "Communication", value: radar?.communication?.score ?? null },
    { label: "Composure", value: radar?.composure?.score ?? null },
  ];
  const hasBehavioralData = radar && (radar.communication.count > 0 || radar.composure.count > 0);

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">📋 Automated Scorecard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Rule-based rubric generated from your {data.totalSubmissions} submissions</p>

      <div className="card mb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
        <p className="text-5xl font-extrabold text-primary-600 my-2">{data.overall}</p>
        <p className="text-xs text-gray-400">out of 100</p>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🕸️ Skill Radar</h3>
        <p className="text-xs text-gray-400 mb-2">
          Technical dimensions come from your code submissions. Communication/Composure come from the Voice Interviewer and Logic Debater —
          {hasBehavioralData ? " try both to fill them in fully." : " try them at least once to see those dimensions."}
        </p>
        <RadarChart data={radarData} />
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Breakdown</h3>
        <ScoreBar label="Problem Solving" value={data.problemSolving} />
        <ScoreBar label="Edge Case Handling" value={data.edgeCaseHandling} />
        <ScoreBar label="Efficiency" value={data.efficiency} />
        <ScoreBar label="Code Cleanliness" value={data.codeCleanliness} />
        {radar?.communication?.score != null && <ScoreBar label="Communication (voice)" value={radar.communication.score} />}
        {radar?.composure?.score != null && <ScoreBar label="Composure (logic debates)" value={radar.composure.score} />}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths</h3>
          {data.strengths?.length === 0 && <p className="text-sm text-gray-400">Keep solving to build up strengths.</p>}
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
            {data.strengths?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">📈 Areas to Improve</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
            {data.improvements?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
