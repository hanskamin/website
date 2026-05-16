type Props = {
  label: string;
  ratio?: string;
  accent?: string;
};

export default function Placeholder({
  label,
  ratio = "16/10",
  accent,
}: Props) {
  const a = accent || "var(--accent)";
  return (
    <div
      className="frame"
      style={{
        aspectRatio: ratio,
        background: `repeating-linear-gradient(45deg, color-mix(in oklch, ${a} 25%, transparent) 0 14px, color-mix(in oklch, ${a} 5%, transparent) 14px 28px)`,
        display: "grid",
        placeItems: "center",
        color: "var(--fg-dim)",
        fontFamily: "var(--font-body), monospace",
        fontSize: 11,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}
    >
      ▸ {label} ◂
    </div>
  );
}
