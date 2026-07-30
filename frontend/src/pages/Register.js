import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, saveSession } from "../services/api";

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Create your account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start practicing DSA the smart, adaptive way</p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="input" placeholder="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input" placeholder="Tech stack (comma separated, e.g. MERN, C#)"
            value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
          <button className="btn-primary mt-1" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
