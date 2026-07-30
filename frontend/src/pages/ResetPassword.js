import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose a new password for your account.</p>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {done ? (
          <p className="text-sm text-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">
            Password reset successful! Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="input" type="password" placeholder="New password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <input className="input" type="password" placeholder="Confirm new password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button className="btn-primary mt-1" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          <Link to="/login" className="text-primary-600 font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
