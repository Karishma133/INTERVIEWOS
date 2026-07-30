import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, saveSession } from "../services/api";

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
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Login to InterviewOS</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Continue practicing DSA & mock interviews</p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button className="btn-primary mt-1" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>

        <p className="text-sm text-right mt-2">
          <Link to="/forgot-password" className="text-primary-600 font-medium">Forgot password?</Link>
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          No account? <Link to="/register" className="text-primary-600 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
