import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#000000",
            a: {
              color: "#0066cc",
              textDecoration: "underline",
              fontWeight: "500",
            },
            h1: {
              color: "#000000",
              fontWeight: "800",
            },
            h2: {
              color: "#000000",
              fontWeight: "700",
            },
            h3: {
              color: "#000000",
              fontWeight: "600",
            },
            strong: {
              color: "#000000",
            },
            code: {
              color: "#000000",
            },
          },
        },
        invert: {
          css: {
            color: "#e5e5e5",
            a: {
              color: "#60a5fa",
            },
            h1: {
              color: "#ffffff",
            },
            h2: {
              color: "#ffffff",
            },
            h3: {
              color: "#ffffff",
            },
            strong: {
              color: "#ffffff",
            },
            code: {
              color: "#e5e5e5",
            },
            blockquote: {
              color: "#d4d4d4",
              borderLeftColor: "#525252",
            },
            hr: {
              borderColor: "#404040",
            },
            "ol > li::marker": {
              color: "#a3a3a3",
            },
            "ul > li::marker": {
              color: "#a3a3a3",
            },
            th: {
              color: "#ffffff",
            },
            td: {
              borderBottomColor: "#404040",
            },
            thead: {
              borderBottomColor: "#525252",
            },
            "tbody tr": {
              borderBottomColor: "#404040",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
