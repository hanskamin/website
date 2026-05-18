type Props = {
  kicker: string;
  title: string;
  sub?: string;
  subGridTemplate?: string;
  subGridGap?: number;
};

export default function SectionHead({
  kicker,
  title,
  sub,
  subGridTemplate,
  subGridGap = 32,
}: Props) {
  const subParagraph = sub ? (
    <p
      style={{
        color: "var(--fg)",
        fontSize: 14,
        lineHeight: 1.7,
        margin: 0,
        padding: "10px 14px",
        background:
          "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
        borderLeft: "2px solid var(--accent-2)",
        boxShadow:
          "0 0 16px color-mix(in oklch, var(--accent-2) 18%, transparent)",
      }}
    >
      {sub}
    </p>
  ) : null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        className="eyebrow"
        style={{
          color: "var(--accent-2)",
          textShadow: "0 0 6px var(--accent-2)",
        }}
      >
        {kicker}
      </div>
      <h1
        className="font-display-tube chrome-text glitch section-title"
        data-text={title}
        style={{
          fontSize: "clamp(40px, 9vw, 120px)",
          margin: "8px 0 12px",
          lineHeight: 0.9,
          wordBreak: "break-word",
        }}
      >
        {title}
      </h1>
      {subParagraph &&
        (subGridTemplate ? (
          <div
            className="section-sub-grid"
            style={{
              display: "grid",
              gridTemplateColumns: subGridTemplate,
              gap: subGridGap,
            }}
          >
            {subParagraph}
            <div aria-hidden="true" />
          </div>
        ) : (
          subParagraph
        ))}
    </div>
  );
}
