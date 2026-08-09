/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: "#0F1A24",      // deep academic navy/ink
          panel: "#16232F",
          line: "#25384A",
          accent: "#C79A4B",  // muted brass/amber - academic seal color
          accent2: "#5FA890", // eligible/present green
          danger: "#C1503F",  // ineligible/absent muted brick red
          text: "#E7E2D6",    // parchment-ish off white
          muted: "#8FA1AE",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
