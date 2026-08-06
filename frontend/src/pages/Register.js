import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, saveSession } from "../services/api";
import FloatingInput from "../components/FloatingInput";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { useToast } from "../context/ToastContext";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 lg:px-8 py-2">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        
        {/* Left Side: Panel & Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-4 pr-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-garnet-600 text-white p-1.5 rounded-lg font-bold text-sm">IO</span>
              <span className="font-display text-xl font-bold text-white">InterviewOS</span>
            </div>
            <h1 className="font-display text-2xl xl:text-3xl font-bold text-white leading-tight mb-2">
              Join the panel.<br />Watch your readiness fill in.
            </h1>
          </div>

          <div className="space-y-2.5 text-xs text-navy-300">
            <div className="flex items-start gap-2.5">
              <span className="text-garnet-500 font-bold">✓</span>
              <p><strong className="text-white">Adaptive DSA</strong> that matches your real pass rate</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-garnet-500 font-bold">✓</span>
              <p><strong className="text-white">System design</strong> reviewed for SPOFs, live</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-garnet-500 font-bold">✓</span>
              <p><strong className="text-white">Behavioral rounds</strong> scored against a rubric</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-garnet-500 font-bold">✓</span>
              <p><strong className="text-white">Aptitude</strong> — the round most platforms skip</p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form (Compact & Fully Visible) */}
        <div className="w-full max-w-md mx-auto bg-navy-900/40 p-5 rounded-2xl border border-navy-800/60 shadow-xl">
          <div className="text-center mb-3">
            <h2 className="font-display text-xl font-bold text-white mb-0.5">Create your account</h2>
            <p className="text-xs text-navy-400">Start practicing DSA the smart, adaptive way</p>
          </div>

          <div className="scale-95 origin-center my-1">
            <SocialLoginButtons />
          </div>

          <div className="flex items-center gap-2 my-2.5">
            <div className="h-px flex-1 bg-navy-800" />
            <span className="text-[11px] text-navy-400">or continue with email</span>
            <div className="h-px flex-1 bg-navy-800" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-900/30 rounded-lg px-3 py-1.5 mb-2 text-center">{error}</p>}

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
              className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-4 py-2 text-xs font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="text-xs text-navy-400 mt-3 text-center">
            Already have an account? <Link to="/login" className="text-garnet-500 font-semibold hover:underline">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}