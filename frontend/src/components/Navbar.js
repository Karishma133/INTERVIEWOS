import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";
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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenMenu]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpenMenu(isOpen ? null : label)}
        className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isOpen
            ? "bg-slate-100 text-indigo-600 dark:bg-slate-800/80 dark:text-indigo-400"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
        }`}
      >
        {label} <span className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700/80 dark:bg-slate-900 py-1.5 z-50">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors"
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
  const location = useLocation();
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLandingHero = !user && location.pathname === "/";

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
    { to: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm dark:bg-slate-950/80 dark:border-slate-800/80 dark:shadow-lg dark:shadow-black/20"
          : "bg-white/40 backdrop-blur-sm border-b border-transparent dark:bg-slate-950/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-3 font-semibold text-xl tracking-tight text-slate-900 dark:text-slate-100 shrink-0"
        >
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            IO
          </div>
          <span className="hidden sm:inline">
            Interview<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1.5">
            <Link to="/dashboard" className="hidden lg:inline px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors">
              Dashboard
            </Link>
            <Link to="/interview" className="hidden lg:inline px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors">
              Interview Room
            </Link>
            <Link to="/room" className="hidden lg:inline px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors">
              Collab Room
            </Link>

            <NavDropdown label="Practice" links={PRACTICE_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            <NavDropdown label="Compete" links={COMPETE_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />
            <NavDropdown label="Insights" links={INSIGHTS_LINKS} openMenu={openMenu} setOpenMenu={setOpenMenu} />

            <Link to="/resume" className="hidden xl:inline px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors">
              Resume
            </Link>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70 ml-2 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {user.publicSlug && (
              <Link
                to={`/u/${user.publicSlug}`}
                title="View/share your public profile"
                className="hidden xl:inline text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 px-2 whitespace-nowrap"
              >
                {user.name} · <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{user.currentLevel}</span>
              </Link>
            )}

            <Link
              to="/settings"
              title="Settings"
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70 transition-colors"
            >
              <SettingsIcon size={17} />
            </Link>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors ml-1"
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu panel */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 max-h-[70vh] overflow-y-auto dark:border-slate-800/80 dark:bg-slate-950">
          <div className="grid grid-cols-2 gap-1.5">
            {allMobileLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
