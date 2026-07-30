import React from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/api";

export default function NotFound() {
  const user = getCurrentUser();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-primary-600 mb-2">404</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist or may have moved.</p>
        <Link to={user ? "/dashboard" : "/"} className="btn-primary">
          {user ? "Back to Dashboard" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
