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
    setError("");
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 lg:px-8 py-4 bg-navy-900">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Panel & Features (Clean & Readable) */}
        <div className="hidden lg:flex flex-col justify-center space-y-5 pr-4 animate-risein">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm shadow-glow">
                IO
              </span>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                InterviewOS
              </span>
            </div>
            <h1 className="font-display text-2xl xl:text-3xl font-bold text-white leading-snug">
              Join the panel.<br />
              <span className="text-primary-400">Watch your readiness fill in.</span>
            </h1>
          </div>

          <div className="space-y-3 text-sm text-navy-200">
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-bold text-base leading-none">✓</span>
              <p><strong className="text-white font-medium">Adaptive DSA</strong> that matches your real pass rate</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-bold text-base leading-none">✓</span>
              <p><strong className="text-white font-medium">System design</strong> reviewed for SPOFs, live</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-bold text-base leading-none">✓</span>
              <p><strong className="text-white font-medium">Behavioral rounds</strong> scored against a rubric</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-bold text-base leading-none">✓</span>
              <p><strong className="text-white font-medium">Aptitude</strong> — the round most platforms skip</p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full max-w-md mx-auto bg-navy-800/90 border border-navy-700/80 p-6 rounded-2xl shadow-panel animate-risein">
          <div className="text-center mb-3.5">
            <h2 className="font-display text-xl font-bold text-white">Create your account</h2>
            <p className="text-xs text-navy-400 mt-0.5">Start practicing DSA the smart, adaptive way</p>
          </div>

          <div className="my-1">
            <SocialLoginButtons />
          </div>

          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-navy-700" />
            <span className="text-[11px] text-navy-400 uppercase tracking-wider">or continue with email</span>
            <div className="h-px flex-1 bg-navy-700" />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-1.5 mb-2.5 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <FloatingInput
              label="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <FloatingInput
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <FloatingInput
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <FloatingInput
              label="Tech stack (comma separated, e.g. MERN, C#)"
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-xs text-navy-400 mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-400 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
