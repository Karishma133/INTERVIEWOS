
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pure project ka ek hi Main Primary Indigo Color
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // Default Button, Badge & Accent
          600: "#4f46e5", // Hover State
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },

        // Dark Theme ke liye standard consistent Dark Slate/Navy shades
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          400: "#94a3b8", // Grey muted text
          600: "#334155",
          700: "#1e293b", // Borders & subtle panels
          800: "#0f172a", // Card Backgrounds
          900: "#0b0f19", // Main Page Background (Uniform Everywhere)
          950: "#060911",
        },

        // Status indicators
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        mint: {
          400: "#34d399",
          500: "#10b981",
        },
      },

      fontFamily: {
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Sora", "Inter", "-apple-system", "sans-serif"],
        mono: ["Fira Code", "ui-monospace", "monospace"],
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.25)",
        panel: "0 25px 50px -12px rgba(11,15,25,0.7)",
        glow: "0 0 20px -3px rgba(99,102,241,0.35)",
        "glow-lg": "0 0 35px -5px rgba(99,102,241,0.45)",
      },

      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        "cta-gradient-hover": "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
      },

      keyframes: {
        drawin: { "0%": { strokeDashoffset: "700", opacity: 0 }, "100%": { strokeDashoffset: "0", opacity: 1 } },
        risein: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        needlein: { "0%": { transform: "rotate(-70deg)" }, "100%": { transform: "rotate(0deg)" } },
        neonpulse: { "0%,100%": { opacity: 0.55 }, "50%": { opacity: 1 } },
      },
      animation: {
        drawin: "drawin 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s both",
        risein: "risein 0.7s cubic-bezier(0.16,1,0.3,1) both",
        needlein: "needlein 1.1s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
        neonpulse: "neonpulse 2.4s ease-in-out 1.6s infinite",
      },
    },
  },
  plugins: [],
};
