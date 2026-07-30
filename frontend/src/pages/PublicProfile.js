import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { badgeLabel } from "../utils/badgeLabels";

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.publicProfile(slug).then(setProfile).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="page-container"><p className="text-gray-400">Profile not found.</p></div>;
  if (!profile) return <div className="page-container"><p className="text-gray-400">Loading...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <div className="card text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-extrabold text-3xl mx-auto mb-3">
          {profile.name[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{profile.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Level {profile.currentLevel} · Score {profile.performanceScore}/100
        </p>
        <span className="badge bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 !text-sm">
          {profile.eloTier} Tier · {profile.eloRating} Elo
        </span>
        {profile.techStack?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {profile.techStack.map((t) => (
              <span key={t} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center !p-4">
          <p className="text-2xl font-extrabold text-primary-600">{profile.totalSolved}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Problems Solved</p>
        </div>
        <div className="card text-center !p-4">
          <p className="text-2xl font-extrabold text-primary-600">{profile.longestStreak}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Longest Streak</p>
        </div>
        <div className="card text-center !p-4">
          <p className="text-2xl font-extrabold text-primary-600">{profile.badges?.length || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Badges Earned</p>
        </div>
      </div>

      {profile.badges?.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🏅 Badges</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((id) => (
              <span key={id} className="badge bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 !text-sm">
                {badgeLabel(id)}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.topicStats?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Topic Performance</h3>
          <div className="space-y-2">
            {profile.topicStats.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="w-32 text-sm text-gray-600 dark:text-gray-300 truncate">{t.topic}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${t.accuracy}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">Verified stats from InterviewOS · interviewos.dev/u/{profile.publicSlug}</p>
    </div>
  );
}
