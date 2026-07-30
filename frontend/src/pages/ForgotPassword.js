import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await api.forgotPassword(email);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Forgot Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="input" type="email" placeholder="Your email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary mt-1" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">{result.message}</p>

            {result.devResetLink && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-2">{result.note}</p>
                <Link to={result.devResetLink.replace(window.location.origin, "")} className="text-sm text-primary-600 font-semibold break-all underline">
                  {result.devResetLink}
                </Link>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Remembered your password? <Link to="/login" className="text-primary-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
