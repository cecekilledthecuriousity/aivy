import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aivy: {
          coral: "#FF9A8B",
          peach: "#FFC3A0",
          yellow: "#FECF6A",
          skyblue: "#A1E3FF",
          navy: "#0F172A",
          slate: "#334155",
          sand: "#FFFDF9",
        },
      },
      boxShadow: {
        soft: "0 12px 32px -4px rgba(255, 154, 139, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
        glass: "0 10px 30px 0 rgba(255, 154, 139, 0.08)",
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
export default config;
