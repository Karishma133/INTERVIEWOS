import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

  // Reliable "click outside to close" — avoids the onBlur+setTimeout race
  // condition where a click on a dropdown Link could get swallowed by the
  // menu closing before React Router's navigation registered.
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
              onClick={() => setOpenMenu(null)}
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
  const location = useLocation();
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Glassmorphism kicks in once the page has scrolled a little — the bar
  // starts near-transparent over the hero and blurs/solidifies as content
  // scrolls underneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The public landing page ("/") always renders a premium dark hero
  // regardless of the app's light/dark toggle — so the navbar over it
  // needs to always be dark too, or a light-mode visitor sees a white
  // bar over a black hero (looks broken). Every other page still
  // respects the normal theme toggle.
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
  ];

  return (
    <nav
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        isLandingHero
          ? scrolled
            ? "bg-navy-950/75 backdrop-blur-xl border-navy-800/70 shadow-lg shadow-black/10"
            : "bg-navy-950/20 backdrop-blur-sm border-transparent"
          : scrolled
            ? "bg-white/75 dark:bg-gray-950/75 backdrop-blur-xl border-gray-100 dark:border-gray-800 shadow-sm"
            : "bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/"}
          className={`flex items-center gap-2 font-display font-bold text-xl shrink-0 ${isLandingHero ? "text-white" : "text-garnet-500"}`}
        >
          <span className="w-8 h-8 rounded-lg bg-garnet-500 text-white flex items-center justify-center text-sm">IO</span>
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
              className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isLandingHero ? "text-gray-400 hover:!bg-gray-800" : "text-gray-500"}`}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link
              to="/login"
              className={isLandingHero
                ? "inline-flex items-center justify-center gap-2 rounded-lg border border-navy-700 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-navy-800 transition-colors"
                : "btn-outline !py-1.5 !px-3"}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={isLandingHero
                ? "inline-flex items-center justify-center gap-2 rounded-lg bg-cta-gradient hover:bg-cta-gradient-hover px-4 py-2.5 text-sm font-semibold text-white shadow-glow-garnet transition-all"
                : "btn-primary !py-1.5 !px-3"}
            >
              Sign up
            </Link>
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
