import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const PRACTICE_LINKS = [
  { to: "/questions", label: "Problems", icon: "📚" },
  { to: "/companies", label: "Companies", icon: "🏢" },
  { to: "/aptitude", label: "Aptitude", icon: "🧮" },
  { to: "/situational", label: "Judgment", icon: "🧭" },
];
const COMPETE_LINKS = [
  { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { to: "/multiplayer", label: "Multiplayer Match", icon: "⚔️" },
];
const INSIGHTS_LINKS = [
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/scorecard", label: "Scorecard", icon: "📋" },
  { to: "/roadmap", label: "Roadmap", icon: "🧭" },
];

function NavDropdown({ label, links, openMenu, setOpenMenu }) {
  const isOpen = openMenu === label;
  const dropdownRef = useRef(null);

  // Click outside hone par dropdown close karna (onBlur ki jagah reliable tareeka)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) {
          setOpenMenu(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenMenu]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpenMenu(isOpen ? null : label)}
        className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isOpen ? "bg-gray-100 dark:bg-gray-800 text-primary-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {label} <span className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card-hover py-1.5 z-50">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpenMenu(null)} // <-- FIX: Click karte hi state close hogi aur page navigate hoga
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const allMobileLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/interview", label: "Interview Room", icon: "🧠" },
    { to: "/room", label: "Collab Room", icon: "👥" },
    { to: "/resume", label: "Resume", icon: "📄" },
    ...PRACTICE_LINKS,
    ...COMPETE_LINKS,
    ...INSIGHTS_LINKS,
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-extrabold text-xl text-primary-600 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm">IO</span>
          <span className="hidden sm:inline">InterviewOS</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="hidden md:inline px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
            <Link to="/interview" className="hidden md:inline px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Interview Room</Link>
            <Link to="/room" className="hidden md:inline px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Collab Room</Link>

            <NavDropdown label="Practice" links={PRACTICE_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            <NavDropdown label="Compete" links={COMPETE_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            <NavDropdown label="Insights" links={INSIGHTS_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />

            <Link to="/resume" className="hidden lg:inline px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Resume</Link>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 ml-1"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {user.publicSlug && (
              <Link to={`/u/${user.publicSlug}`} title="View/share your public profile"
                className="hidden lg:inline text-xs text-gray-400 hover:text-primary-600 px-2 whitespace-nowrap">
                {user.name} · <span className="text-primary-600 font-semibold">{user.currentLevel}</span>
              </Link>
            )}

            <button onClick={handleLogout} className="hidden md:inline-flex btn-outline !py-1.5 !px-3 ml-1">Logout</button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link to="/login" className="btn-outline !py-1.5 !px-3">Login</Link>
            <Link to="/register" className="btn-primary !py-1.5 !px-3">Sign up</Link>
          </div>
        )}
      </div>

      {/* Mobile menu panel */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {allMobileLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
          </div>
          <button onClick={handleLogout} className="btn-outline w-full mt-3">Logout</button>
        </div>
      )}
    </nav>
  );
}