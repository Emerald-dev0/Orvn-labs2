/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",
        "ink-mid": "#66717A",
        "ink-dim": "#9A9A95",
        background: "#F5F1EA",
        surface: "#EDEAE3",
        line: "#D8D8D5",
        "line-strong": "#BFBFB8",
        primary: {
          DEFAULT: "#397D77",
          light: "#4A948D",
          dark: "#2B635E",
          pale: "#E6F0EE",
        },
        signal: {
          risk: "#DC2626",
          "risk-pale": "#FEF2F2",
          ok: "#0D9E6E",
          "ok-pale": "#ECFDF5",
          warn: "#D97706",
          "warn-pale": "#FFFBEB",
        },
      },
      fontFamily: {
        serif: ["'Instrument Serif'", "Georgia", "serif"],
        sans: ["'Manrope'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,15,0.04), 0 4px 16px rgba(10,10,15,0.05)",
        "card-hover": "0 2px 4px rgba(10,10,15,0.06), 0 12px 28px rgba(10,10,15,0.08)",
        ring: "0 0 0 4px rgba(57,125,119,0.12)",
      },
      maxWidth: {
        page: "1160px",
        prose: "680px",
      },
    },
  },
  plugins: [],
};
