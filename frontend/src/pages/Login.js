import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, saveSession } from "../services/api";
import FloatingInput from "../components/FloatingInput";
import SocialLoginButtons from "../components/SocialLoginButtons";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await api.login(form);
      saveSession({ token: data.token, user: data });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-gray-100 mb-1">Login to InterviewOS</h2>
        <p className="text-sm text-navy-500 dark:text-gray-400 mb-6">Continue practicing DSA & mock interviews</p>

        <SocialLoginButtons />

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
          <span className="text-xs text-navy-400">or continue with email</span>
          <div className="h-px flex-1 bg-navy-100 dark:bg-navy-800" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FloatingInput label="Email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FloatingInput label="Password" type="password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-4 py-2.5 text-sm font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-right mt-2">
          <Link to="/forgot-password" className="text-garnet-500 font-medium">Forgot password?</Link>
        </p>

        <p className="text-sm text-navy-500 dark:text-gray-400 mt-6 text-center">
          No account? <Link to="/register" className="text-garnet-500 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}