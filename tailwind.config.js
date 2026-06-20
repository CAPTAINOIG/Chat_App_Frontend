/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50",
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        accent: {
          50:  "#e0f2fe",
          100: "#bae6fd",
          200: "#7dd3fc",
          300: "#38bdf8",
          400: "#0ea5e9",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#082f49",
        },
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        whatsapp: {
          sidebar: "#f0f2f5",
          chat: "#efeae2",
          sent: "#d9fdd3",
          received: "#ffffff",
          text: "#111b21",
          secondary: "#667781",
        },
      },
      fontFamily: {
        sans: ["Inter", "Mirza", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px 0 rgba(99,102,241,0.10)",
        glow: "0 0 0 3px rgba(99,102,241,0.25)",
      },
    },
  },
  plugins: [],
}