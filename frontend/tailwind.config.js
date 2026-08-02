/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        // --- Landing-page-only palette (Instrument Panel design) ---
        navy: {
          50: "#eef1f6", 200: "#c4cee0", 400: "#5b7099",
          600: "#2a4470", 700: "#1e3151", 800: "#16253d",
          900: "#0f1b2e", 950: "#0b1220",
        },
        garnet: {
          300: "#e8899a", 400: "#d64f66", 500: "#c4293f",
          600: "#a81f33", 700: "#841829",
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
        "glow-garnet": "0 0 0 1px rgba(196,41,63,0.15), 0 10px 30px rgba(196,41,63,0.18)",
        "glow-garnet-lg": "0 0 0 1px rgba(196,41,63,0.2), 0 14px 40px rgba(196,41,63,0.32)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #d64f66 0%, #c4293f 55%, #a81f33 100%)",
        "cta-gradient-hover": "linear-gradient(135deg, #e0637a 0%, #c4293f 55%, #b3213a 100%)",
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