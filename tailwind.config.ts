import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#000000",
        frost: "#ffffff",
        shadow: "#181818",
        whisper: "#6d6d6d",
        misty: "#636363",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        caption: ["11px", { lineHeight: "1.45" }],
        body: ["16px", { lineHeight: "1.58" }],
        sub: ["18px", { lineHeight: "1.5" }],
        "h-sm": ["29px", { lineHeight: "1.2" }],
        h: ["39px", { lineHeight: "1.1" }],
        "h-lg": ["54px", { lineHeight: "1.05" }],
        display: ["225px", { lineHeight: "0.7" }],
      },
      borderRadius: {
        pill: "75.024px",
        card: "10px",
      },
      maxWidth: {
        well: "1078px",
      },
      spacing: {
        card: "34px",
        section: "46px",
        elem: "14px",
        "btn-y": "11.232px",
        "btn-x": "33.696px",
      },
      backgroundImage: {
        "deep-ocean":
          "linear-gradient(90deg, rgb(160,224,171), rgb(255,172,46) 50%, rgb(165,45,37))",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.08)" },
        },
        hue: {
          "0%, 100%": { filter: "hue-rotate(0deg)" },
          "50%": { filter: "hue-rotate(20deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift 26s ease-in-out infinite",
        "drift-slower": "drift 32s ease-in-out infinite",
        hue: "hue 24s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-down": "slide-down 0.25s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
