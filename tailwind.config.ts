import type { Config } from "tailwindcss";

// Tailwind supplies only the base reset. All styles are in app/globals.css.
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
