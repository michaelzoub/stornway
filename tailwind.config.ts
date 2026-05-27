import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(255 253 247 / <alpha-value>)",
        foreground: "rgb(15 27 8 / <alpha-value>)",
        card: "rgb(255 253 247 / <alpha-value>)",
        "card-foreground": "rgb(15 27 8 / <alpha-value>)",
        "muted-foreground": "rgb(93 102 97 / <alpha-value>)",
      },
    },
  },
  plugins: [],
} satisfies Config;

