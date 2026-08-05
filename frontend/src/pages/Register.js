import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code2, Network, Brain, MessageSquare } from "lucide-react";
import { api, saveSession } from "../services/api";
import FloatingInput from "../components/FloatingInput";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { useToast } from "../context/ToastContext";

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
  const toast = useToast();

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
      toast.success(`Welcome to InterviewOS, ${data.name?.split(" ")[0] || "there"}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    /* CHANGED: min-h ko fixed height h-[calc(100vh-4rem)] me badla aur overflow-hidden lagaya */
    <div className="h-[calc(100vh-4rem)] overflow-hidden grid lg:grid-cols-2">
      {/* Left — brand panel (hidden on small screens) */}
      {/* CHANGED: p-10 xl:p-14 se padding kam karke p-8 xl:p-10 kiya */}
      <div className="hidden lg:flex relative bg-navy-950 flex-col justify-between p-8 xl:p-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-garnet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl text-white">
            <span className="w-8 h-8 rounded-lg bg-garnet-500 text-white flex items-center justify-center text-sm">IO</span>
            InterviewOS
          </Link>
        </div>

        <div className="relative">
          {/* CHANGED: mb-6 ko mb-4 kiya aur text size adjust kiya */}
          <h2 className="font-display text-2xl xl:text-3xl font-bold text-white leading-tight mb-4">
            Join the panel.
            <br />
            Watch your readiness fill in.
          </h2>
          {/* CHANGED: space-y-4 ko space-y-3 kiya */}
          <div className="space-y-3">
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
      {/* CHANGED: py-10 sm:py-14 ko kam karke py-4 sm:py-6 kiya */}
      <div className="flex items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-gray-100 mb-1">Create your account</h2>
          {/* CHANGED: mb-6 ko mb-4 kiya */}
          <p className="text-sm text-navy-500 dark:text-gray-400 mb-4">Start practicing DSA the smart, adaptive way</p>

          <SocialLoginButtons />

          {/* CHANGED: my-5 ko my-3 kiya */}
          <div className="flex items-center gap-3 my-3">
            <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
            <span className="text-xs text-navy-400">or continue with email</span>
            <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-3">{error}</p>}

          {/* CHANGED: gap-3 ko thoda kam karke gap-2.5 kiya form inputs ke beech */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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

          {/* CHANGED: mt-6 ko mt-4 kiya */}
          <p className="text-sm text-navy-500 dark:text-gray-400 mt-4 text-center">
            Already have an account? <Link to="/login" className="text-garnet-500 font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
