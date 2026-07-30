import React from "react";
import { Link, Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

const FEATURES = [
  { icon: "🧠", title: "Adaptive DSA Interviews", desc: "Questions get harder or easier based on your real performance — like a real interviewer reading the room." },
  { icon: "🗣️", title: "AI Logic Debater", desc: "After you pass, defend your approach out loud. It's not just \"did it pass,\" it's \"do you understand it.\"" },
  { icon: "🎙️", title: "Voice Mock Interviewer", desc: "Practice explaining your solution out loud and get real feedback on pace, filler words, and clarity." },
  { icon: "⚔️", title: "Elo-Matched Multiplayer", desc: "Get paired with another candidate near your rating — one interviews, one solves, just like chess.com." },
  { icon: "🖊️", title: "System Design Whiteboard", desc: "Draw AWS-style architecture diagrams and get a rule-based review flagging SPOFs and missing load balancers." },
  { icon: "📄", title: "AI Resume Builder", desc: "Turn your skills and projects into a clean, ATS-friendly PDF in minutes." },
];

export default function Landing() {
  const user = getCurrentUser();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="page-container text-center py-16 sm:py-24">
          <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-4">
            🚀 Free · No AI subscription required
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Interview practice that actually <span className="text-primary-600">interviews</span> you
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            DSA, aptitude, system design, resume building, and behavioral rounds — all in one place,
            all built on algorithms you can explain in your own interview.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="btn-primary !px-6 !py-3">Get started free</Link>
            <Link to="/login" className="btn-outline !px-6 !py-3">Login</Link>
          </div>
        </div>
      </section>

      <section className="page-container py-16">
        <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-2">Built for the whole interview loop</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Not just LeetCode clones — the parts most platforms skip.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="page-container py-16 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">Ready to practice like it's the real thing?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Free account, no credit card, no external AI subscription needed.</p>
          <Link to="/register" className="btn-primary !px-8 !py-3 !text-base">Create your account</Link>
        </div>
      </section>
    </div>
  );
}
