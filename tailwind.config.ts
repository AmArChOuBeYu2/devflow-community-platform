import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#f48225", // Stack Overflow orange
          dark: "#da680f",
          light: "#fef3e9",
        },
        accent: {
          DEFAULT: "#0077cc",
          hover: "#005999",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
