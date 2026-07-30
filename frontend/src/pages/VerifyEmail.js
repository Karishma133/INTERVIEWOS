import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.verifyEmail(token)
      .then((res) => { setStatus("success"); setMessage(res.message); })
      .catch((err) => { setStatus("error"); setMessage(err.message); });
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-500 dark:text-gray-400">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Email Verified!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <Link to="/dashboard" className="btn-primary w-full inline-flex justify-center">Go to Dashboard</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Verification Failed</h2>
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-6">{message}</p>
            <Link to="/dashboard" className="btn-outline w-full inline-flex justify-center">Back to Dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
}
