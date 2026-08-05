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
    /* Main container ko center me align kiya gaya hai, bilkul login page ki tarah */
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-8">
      
      <div className="w-full max-w-sm">
        
        {/* Heading section ko center kiya gaya hai */}
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-sm text-navy-400">Start practicing DSA the smart, adaptive way</p>
        </div>

        <SocialLoginButtons />

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-navy-800" />
          <span className="text-xs text-navy-400">or continue with email</span>
          <div className="h-px flex-1 bg-navy-800" />
        </div>

        {error && <p className="text-sm text-red-500 bg-red-900/30 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FloatingInput label="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FloatingInput label="Email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FloatingInput label="Password" type="password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FloatingInput label="Tech stack (comma separated, e.g. MERN, C#)"
            value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />

          <button
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient hover:bg-cta-gradient-hover px-4 py-3 text-sm font-semibold text-white shadow-glow-garnet hover:shadow-glow-garnet-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-navy-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-garnet-500 font-semibold hover:underline">Login</Link>
        </p>
        
      </div>
    </div>
  );
}
