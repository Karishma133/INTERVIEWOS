/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Unified brand palette (used everywhere: app pages AND landing/auth) ---
        // "primary" is aliased to the same electric indigo/violet scale so every page —
        // Dashboard, Questions, CompanyPrep, Cards, Landing, Login/Register — shares one
        // brand color. Indigo-violet reads as modern/AI-native for 2026 SaaS products.
        primary: {
          50: "#f2f0ff", 100: "#e6e1ff", 200: "#cabcff", 300: "#a68cff",
          400: "#8b5cf6", 500: "#7c3aed", 600: "#6d28d9", 700: "#5b21b6",
          800: "#4c1d95", 900: "#3b1578",
        },
        navy: {
          50: "#eef1f6", 100: "#dfe5ef", 200: "#c4cee0", 300: "#9fb0cc",
          400: "#5b7099", 500: "#3d557f", 600: "#2a4470", 700: "#1e3151",
          800: "#16253d", 900: "#0f1b2e", 950: "#0b1220",
        },
        garnet: {
          50: "#f2f0ff", 100: "#e6e1ff", 200: "#cabcff", 300: "#a68cff",
          400: "#8b5cf6", 500: "#7c3aed", 600: "#6d28d9", 700: "#5b21b6",
          800: "#4c1d95", 900: "#3b1578",
        },
        gold: {
          300: "#e8cd82", 400: "#d9a83b", 500: "#c08f22", 600: "#9c7318",
        },
        mint: {
          400: "#3ecf98", 500: "#1fa97d", 600: "#178762",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Sora", "Inter", "-apple-system", "sans-serif"],
        mono: ["Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.08)",
        panel: "0 40px 90px -25px rgba(11,18,32,0.45)",
        "glow-garnet": "0 0 0 1px rgba(124,58,237,0.18), 0 10px 30px rgba(124,58,237,0.20)",
        "glow-garnet-lg": "0 0 0 1px rgba(124,58,237,0.25), 0 14px 40px rgba(124,58,237,0.35)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #a68cff 0%, #7c3aed 55%, #6d28d9 100%)",
        "cta-gradient-hover": "linear-gradient(135deg, #b39dff 0%, #8b5cf6 55%, #7c3aed 100%)",
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
