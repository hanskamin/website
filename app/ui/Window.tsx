import type { ReactNode, CSSProperties } from "react";

type Props = {
  title: string;
  accent?: string;
  children: ReactNode;
  style?: CSSProperties;
};

export default function Window({ title, accent, children, style }: Props) {
  const a = accent || "var(--accent)";
  return (
    <div
      style={{
        border: `1px solid color-mix(in oklch, ${a} 55%, transparent)`,
        background: "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
        boxShadow: `0 0 0 1px color-mix(in oklch, ${a} 18%, transparent) inset, 0 0 32px color-mix(in oklch, ${a} 26%, transparent)`,
        borderRadius: 2,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: `1px solid color-mix(in oklch, ${a} 45%, transparent)`,
          background: `linear-gradient(90deg, color-mix(in oklch, ${a} 38%, var(--panel-hd)), var(--panel-hd))`,
          fontFamily: "var(--font-body), monospace",
          fontSize: 10,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "var(--fg)",
        }}
      >
        <span>▸ {title}</span>
        <span style={{ color: "var(--fg-dim)" }}>▢ ▢ ✕</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
