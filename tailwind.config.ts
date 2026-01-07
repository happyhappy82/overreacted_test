import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "var(--text)",
            a: {
              color: "var(--lightLink)",
              textDecoration: "underline",
              fontWeight: "500",
            },
            h1: {
              color: "var(--text)",
              fontWeight: "800",
            },
            h2: {
              color: "var(--text)",
              fontWeight: "700",
            },
            h3: {
              color: "var(--text)",
              fontWeight: "600",
            },
            strong: {
              color: "var(--text)",
            },
            code: {
              color: "var(--text)",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
export default config;
