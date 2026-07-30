import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getCurrentUser } from "../services/api";
import { StatCard, SessionCard } from "../components/Cards";
import { badgeLabel } from "../utils/badgeLabels";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const user = getCurrentUser();
  const [overview, setOverview] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);
  const [dismissedStreak, setDismissedStreak] = useState(false);

  const loadInterviews = () => api.myScheduledInterviews().then(setInterviews).catch(() => {});

  useEffect(() => {
    api.analyticsOverview().then(setOverview).catch(() => {}).finally(() => setLoading(false));
    loadInterviews();
  }, []);

  const handleResendVerification = async () => {
    setResending(true); setResendStatus("");
    try {
      const res = await api.resendVerification();
      setResendStatus(res.devVerificationLink ? `Dev link: ${res.devVerificationLink}` : "Verification email sent — check your inbox!");
    } catch (err) {
      setResendStatus(err.message);
    } finally { setResending(false); }
  };

  const solvedToday = user?.lastSolvedDate === todayStr();
  const showStreakReminder = !dismissedStreak && user?.totalSolved > 0 && !solvedToday;

  return (
    <div className="page-container">
      {/* ---- Hero greeting ---- */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-7 mb-6 text-white shadow-card">
        <h1 className="text-2xl font-extrabold mb-1">Welcome back, {user?.name} 👋</h1>
        <p className="text-primary-100">
          Current level: <span className="font-semibold text-white">{user?.currentLevel}</span>
          {user?.currentStreak > 0 && <span className="ml-3">🔥 {user.currentStreak}-day streak</span>}
          {user?.eloRating && <span className="ml-3">⭐ {user.eloRating} Elo</span>}
        </p>
      </div>

      {/* ---- Email verification banner ---- */}
      {user && user.emailVerified === false && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">📧 Please verify your email to secure your account.</p>
          <button onClick={handleResendVerification} disabled={resending} className="btn-secondary !py-1.5 !px-3 !text-xs whitespace-nowrap">
            {resending ? "Sending..." : "Resend link"}
          </button>
        </div>
      )}
      {resendStatus && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 break-all">{resendStatus}</p>}

      {/* ---- Daily practice reminder banner ---- */}
      {showStreakReminder && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 mb-6">
          <p className="text-sm text-orange-800 dark:text-orange-300">
            🔥 You haven't practiced today — solve one problem to keep your {user.currentStreak}-day streak alive!
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/interview" className="btn-primary !py-1.5 !px-3 !text-xs">Practice now</Link>
            <button onClick={() => setDismissedStreak(true)} className="text-orange-400 hover:text-orange-600 text-lg leading-none">✕</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="✅" label="Problems Solved" value={user?.totalSolved || 0} />
        <StatCard icon="🔥" label="Current Streak" value={`${user?.currentStreak || 0} days`} />
        <StatCard icon="🎯" label="Accuracy" value={loading ? "…" : overview ? `${overview.overallAccuracy}%` : "—"} />
        <StatCard icon="⚡" label="Score" value={user?.performanceScore || 50} />
      </div>

      {user?.badges?.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🏅 Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((id) => (
              <span key={id} className="badge bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 !text-sm">
                {badgeLabel(id)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link to="/interview" className="card card-hover">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Start Interview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get an adaptive question and solve it in the code editor.</p>
        </Link>
        <Link to="/questions" className="card card-hover">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Problem Bank</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Browse all questions by topic, difficulty, and company.</p>
        </Link>
        <Link to="/companies" className="card card-hover">
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Company Prep Sets</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Curated bundles by the companies that actually ask them.</p>
        </Link>
        <Link to="/room" className="card card-hover">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Collaborative Room</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Code + whiteboard live with a friend.</p>
        </Link>
        <Link to="/multiplayer" className="card card-hover">
          <div className="text-3xl mb-3">⚔️</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiplayer Match</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Elo-matched peer interview — take turns being interviewer.</p>
        </Link>
        <Link to="/analytics" className="card card-hover">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">See which topics you're strong in and which need work.</p>
        </Link>
        <Link to="/roadmap" className="card card-hover">
          <div className="text-3xl mb-3">🧭</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Personalized Roadmap</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deep adaptive learning — ranked by accuracy, speed & attempts.</p>
        </Link>
        <Link to="/aptitude" className="card card-hover">
          <div className="text-3xl mb-3">🧮</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Aptitude Practice</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quantitative, Logical & Verbal reasoning — the round most platforms skip.</p>
        </Link>
        <Link to="/resume" className="card card-hover">
          <div className="text-3xl mb-3">📄</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">AI Resume Builder</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suggested wording + auto-formatted MNC-ready PDF, in minutes.</p>
        </Link>
        <Link to="/situational" className="card card-hover">
          <div className="text-3xl mb-3">🧭</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Situational Judgment</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Crisis management, leadership & ethics scenarios — voice-narrated.</p>
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">📅 Upcoming Mock Interviews</h3>
          <button onClick={() => setShowSchedule(true)} className="btn-secondary !py-1.5 !px-3 !text-sm">+ Schedule</button>
        </div>
        {interviews.length === 0 ? (
          <p className="text-sm text-gray-400">No interviews scheduled. Book a mock interview slot to practice with structure.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((iv) => (
              <SessionCard
                key={iv._id}
                type="Upcoming Interview"
                name={iv.interviewerName}
                dateTimeLabel={`${new Date(iv.scheduledAt).toLocaleString()} · ${iv.topic}`}
                onJoin={() => (window.location.href = `/interview?room=${iv.roomId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onCreated={loadInterviews} />}
    </div>
  );
}

function ScheduleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ scheduledAt: "", interviewerName: "AI Interviewer", topic: "General DSA" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.scheduleInterview(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-sm">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Schedule Mock Interview</h3>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" type="datetime-local" required
            value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <input className="input" placeholder="Interviewer name" value={form.interviewerName}
            onChange={(e) => setForm({ ...form, interviewerName: e.target.value })} />
          <input className="input" placeholder="Topic focus" value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button className="btn-primary flex-1" disabled={saving}>{saving ? "Saving..." : "Schedule"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
