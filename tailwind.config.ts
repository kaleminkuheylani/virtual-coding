import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        panel: "#111827",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
