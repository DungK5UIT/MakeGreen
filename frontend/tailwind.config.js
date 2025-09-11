/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16A34A",
        "primary-hover": "#15803D",
        secondary: "#22C55E",
        dark: "#064E3B",
        "neutral-900": "#0F172A",
        "neutral-600": "#475569",
        "neutral-100": "#F1F5F9",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px"
      }
    },
  },
  plugins: [],
}
