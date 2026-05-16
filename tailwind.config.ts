import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Synthwave palette
        "ink-0": "oklch(0.07 0.04 290)",
        "ink-1": "oklch(0.12 0.06 290)",
        "ink-2": "oklch(0.20 0.10 305)",
        "ink-3": "oklch(0.32 0.16 325)",
        "neon-pink": "oklch(0.74 0.24 355)",
        "neon-magenta": "oklch(0.66 0.28 340)",
        "neon-cyan": "oklch(0.86 0.18 215)",
        "neon-sunset": "oklch(0.78 0.20 50)",
        "neon-lime": "oklch(0.86 0.22 140)",
        "panel-1": "oklch(0.10 0.05 295)",
        "panel-2": "oklch(0.08 0.04 290)",
        "panel-hd": "oklch(0.14 0.08 305)",
        // Legacy aliases (still used by other pages until they get redesigned)
        midnight: "oklch(0.07 0.04 290)",
        frost: "#ffe6f3",
        shadow: "#181818",
        whisper: "#b39ad6",
        misty: "#8a7aad",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "ui-monospace", "monospace"],
        body: ["var(--font-body)", "ui-monospace", "monospace"],
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
        well: "1280px",
      },
      spacing: {
        card: "34px",
        section: "46px",
        elem: "14px",
        "btn-y": "11.232px",
        "btn-x": "33.696px",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "0.35" },
        },
        "grid-scroll": {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "0 56px, 0 56px" },
        },
        marquee: {
          to: { transform: "translateX(-100%)" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
        "page-in": {
          from: {
            opacity: "0",
            transform: "translateY(8px) scale(0.995)",
            filter: "blur(6px)",
          },
          to: { opacity: "1", transform: "none", filter: "none" },
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
        twinkle: "twinkle 4s ease-in-out infinite",
        "grid-scroll": "grid-scroll 5.2s linear infinite",
        marquee: "marquee 28s linear infinite",
        blink: "blink 1.1s steps(2, end) infinite",
        "page-in": "page-in 420ms cubic-bezier(.2,.7,.2,1)",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-down": "slide-down 0.25s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
