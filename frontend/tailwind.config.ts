import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B7C73",
        accent: "#F59E0B",
        ink: "#0F172A",
        surface: "#0B1221",
        muted: "#9CA3AF"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 10px 60px rgba(11, 124, 115, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
