import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getCurrentUser, clearSession } from "../services/api";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Account</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Name: {user?.name || "Not available"}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Email: {user?.email || "Not available"}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition"
        >
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}