import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";

type Role = {
  year: string;
  role: string;
  co: string;
  link: string | null;
  body: string;
};

const TIMELINE: Role[] = [
  {
    year: "2025",
    role: "Fullstack Engineer",
    co: "Reflex",
    link: "https://reflex.careers",
    body: "Building the future of retail work -- unlocking flexibility for both workers and employers.",
  },
  {
    year: "2024",
    role: "Software Engineer",
    co: "Hitch",
    link: "https://hitch.com/book",
    body: "Built and shipped the latest redesign of the web app's booking system.",
  },
  {
    year: "2023",
    role: "Founding Engineer",
    co: "DPP Tech",
    link: "https://dpptech.com",
    body: "First hire on a pre-seed AI startup. Led product & engineering from scratch -- shipped MVP to a rapidly growing set of beta users in Miami, FL.",
  },
  {
    year: "2019–23",
    role: "Software Engineer",
    co: "Walmart",
    link: "https://www.linkedin.com/posts/hanskamin_teamwalmart-activity-6450815886025584640-rrat?utm_source=share&utm_medium=member_desktop&rcm=ACoAAB2ZIl0B5TfpjC2rjj96rQ7y2-u5h33Psqs",
    body: "Four years building in React + React Native on the frontend, plus heavy Node.js on the backend. Austin, TX.",
  },
  {
    year: "2015–19",
    role: "Computer Science",
    co: "Cal Poly SLO",
    link: "https://www.calpoly.edu/",
    body: "Studied computer science. Learn-by-doing. San Luis Obispo, CA.",
  },
];

const STACK_ITEMS: { tag: string; label: string }[] = [
  { tag: "FRONT", label: "React" },
  { tag: "FRONT", label: "React Native" },
  { tag: "FRONT", label: "Next.js" },
  { tag: "FRONT", label: "TypeScript" },
  { tag: "BACK", label: "Node.js" },
  { tag: "BACK", label: "Python" },
  { tag: "BACK", label: "Postgres" },
  { tag: "BACK", label: "Redis" },
  { tag: "INFRA", label: "AWS" },
  { tag: "INFRA", label: "Vercel" },
];

export default function SoftwarePage() {
  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 02"
        title="SOFTWARE"
        sub="Fullstack engineer. React / React Native / Node / Python. Currently at Reflex in Austin, TX."
        subGridTemplate="minmax(0, 2fr) minmax(0, 1fr)"
      />

      <div
        className="software-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 32,
        }}
      >
        <Window title="career.log" accent="var(--accent)">
          {TIMELINE.map((t, i) => (
            <div
              key={t.year + t.co}
              className="career-row"
              style={{
                padding: "20px 0",
                borderTop:
                  i === 0
                    ? "none"
                    : "1px dashed color-mix(in oklch, var(--accent) 35%, transparent)",
                position: "relative",
              }}
            >
              <div
                className="career-year font-display-tube"
                style={{
                  color: "var(--accent-2)",
                  fontSize: 22,
                  textShadow: "0 0 8px var(--accent-2)",
                }}
              >
                {t.year}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="career-role font-display-tube"
                    style={{ color: "var(--fg)", fontSize: 22 }}
                  >
                    {t.role}
                  </span>
                  <span className="tiny" style={{ color: "var(--fg-dim)" }}>
                    at
                  </span>
                  {t.link ? (
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noreferrer"
                      className="career-co font-display-tube glitch"
                      data-text={t.co}
                      style={{
                        color: "var(--accent)",
                        fontSize: 22,
                        textShadow: "0 0 10px var(--accent)",
                      }}
                    >
                      {t.co}
                    </a>
                  ) : (
                    <span
                      className="career-co font-display-tube"
                      style={{
                        color: "var(--accent)",
                        fontSize: 22,
                        textShadow: "0 0 10px var(--accent)",
                      }}
                    >
                      {t.co}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    color: "var(--fg-dim)",
                    marginTop: 8,
                    fontSize: 14,
                    lineHeight: 1.75,
                  }}
                >
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </Window>

        <div
          className="software-side"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <Window title="stack.cfg" accent="var(--accent-2)">
            <div className="vmarquee">
              <ul>
                {[...STACK_ITEMS, ...STACK_ITEMS].map((s, i) => (
                  <li key={i}>
                    <b>{s.tag}</b> {s.label}
                  </li>
                ))}
              </ul>
            </div>
          </Window>

          <Window title="links.lnk" accent="var(--accent)" style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                height: "100%",
                justifyContent: "center",
              }}
            >
              <LinkRow
                href="https://songtransposer.com"
                label="songtransposer.com"
                tag="SNG"
              />
              <LinkRow
                href="https://github.com/hanskamin"
                label="github.com/hanskamin"
                tag="GIT"
              />
              <LinkRow
                href="https://linkedin.com/in/hanskamin"
                label="linkedin.com/in/hanskamin"
                tag="LNK"
              />
              <LinkRow
                href="https://reflex.careers"
                label="reflex.careers"
                tag="WRK"
              />
            </div>
          </Window>
        </div>
      </div>

      <style>{`
        .career-row {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 24px;
        }
        @media (max-width: 767px) {
          .software-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .career-row {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 16px 0 !important;
          }
          .career-year { font-size: 16px !important; }
          .career-role,
          .career-co { font-size: 17px !important; }
        }
      `}</style>
    </div>
  );
}

function LinkRow({
  href,
  label,
  tag,
}: {
  href: string;
  label: string;
  tag: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        border: "1px solid color-mix(in oklch, var(--accent) 35%, transparent)",
        background: "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
        color: "var(--fg)",
        textDecoration: "none",
      }}
    >
      <span className="tag pink" style={{ flexShrink: 0 }}>
        {tag}
      </span>
      <span style={{ fontFamily: "var(--body-stack)", fontSize: 12 }}>
        {label}
      </span>
      <span style={{ marginLeft: "auto", color: "var(--accent)" }}>▸</span>
      <style>{`
        .link-row:hover {
          background: linear-gradient(180deg, color-mix(in oklch, var(--accent) 22%, var(--panel-1)), var(--panel-2)) !important;
          transition: var(--t-fast);
        }
      `}</style>
    </a>
  );
}
