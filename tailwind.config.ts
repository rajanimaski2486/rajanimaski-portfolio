import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--base)",
        surface: "var(--surface)",
        panel: "var(--panel)",
        accent: {
          DEFAULT: "var(--accent)",
          // tints used by the inline chat-invite bar
          tint: "rgba(var(--accent-rgb), 0.06)",
          ring: "rgba(var(--accent-rgb), 0.25)",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        // shadcn aliases
        background: "var(--base)",
        foreground: "var(--text-primary)",
      },
      borderColor: {
        DEFAULT: "var(--border-default)",
        hover: "var(--border-hover)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontWeight: {
        // Two weights only, site-wide.
        normal: "400",
        medium: "500",
      },
      maxWidth: {
        content: "760px",
      },
      keyframes: {
        "pill-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(var(--accent-rgb), 0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(var(--accent-rgb), 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(var(--accent-rgb), 0)" },
        },
      },
      animation: {
        // two iterations, then settles (Day 4 pill). Never loops.
        "pill-pulse": "pill-pulse 1.4s ease-out 2",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
