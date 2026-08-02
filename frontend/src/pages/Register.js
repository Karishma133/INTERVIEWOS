import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code2, Network, Brain, MessageSquare } from "lucide-react";
import { api, saveSession } from "../services/api";
import FloatingInput from "../components/FloatingInput";
import SocialLoginButtons from "../components/SocialLoginButtons";

const PANEL_POINTS = [
  { icon: Code2, text: "Adaptive DSA that matches your real pass rate" },
  { icon: Network, text: "System design reviewed for SPOFs, live" },
  { icon: MessageSquare, text: "Behavioral rounds scored against a rubric" },
  { icon: Brain, text: "Aptitude — the round most platforms skip" },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", techStack: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        techStack: form.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const data = await api.register(payload);
      saveSession({ token: data.token, user: data });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left — brand panel (hidden on small screens) */}
      <div className="hidden lg:flex relative bg-navy-950 flex-col justify-between p-10 xl:p-14 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-garnet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-white">
            <span className="w-8 h-8 rounded-lg bg-garnet-500 text-white flex items-center justify-center text-sm">IO</span>
            InterviewOS
          </Link>
        </div>

        <div className="relative">
          <h2 className="font-display text-3xl font-bold text-white leading-tight mb-6">
            Join the panel.
            <br />
            Watch your readiness fill in.
          </h2>
          <div className="space-y-4">
            {PANEL_POINTS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <p.icon size={15} className="text-garnet-400" />
                </span>
                <p className="text-sm text-navy-200">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-navy-500">Free forever. No external AI subscription required.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-gray-100 mb-1">Create your account</h2>
          <p className="text-sm text-navy-500 dark:text-gray-400 mb-6">Start practicing DSA the smart, adaptive way</p>

          <SocialLoginButtons />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
            <span className="text-xs text-navy-400">or continue with email</span>
            <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <FloatingInput label="Full name" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FloatingInput label="Email" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FloatingInput label="Password" type="password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <FloatingInput label="Tech stack (comma separated, e.g. MERN, C#)"
              value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />

            <button
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-4 py-2.5 text-sm font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-navy-500 dark:text-gray-400 mt-6 text-center">
            Already have an account? <Link to="/login" className="text-garnet-500 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}