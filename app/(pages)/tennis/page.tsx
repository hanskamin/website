import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";
import PongCourt from "./PongCourt";

export default function TennisPage() {
  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 04"
        title="TENNIS"
        sub="Yellow felt, painted lines, early mornings. Mostly hardcourt."
      />

      <div
        className="tennis-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        <Window title="court.viz" accent="var(--neon-lime)">
          <PongCourt />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginTop: 18,
            }}
          >
            <Spec k="GRIP" v="SEMI-WESTERN" />
            <Spec k="RACQUET" v="EZONE 98" />
            <Spec k="FAV SHOT" v="FOREHAND" />
            <Spec k="FAV SURFACE" v="CLAY" />
          </div>
        </Window>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Window title="log.txt" accent="var(--accent-2)">
            <p
              style={{
                color: "var(--fg)",
                fontSize: 14,
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              A lifelong obsession. I picked up a racquet for the first time at
              5 years old and haven&rsquo;t put it down. You can often find
              me on any public courts, either after sunrise or before sunset.
            </p>
            <p
              style={{
                color: "var(--fg-dim)",
                fontSize: 13,
                lineHeight: 1.85,
                margin: "12px 0 0",
              }}
            >
              A crisp forehand down the line is my favorite shot. No better
              feeling.
            </p>
          </Window>

          <Window title="rivals.dir" accent="var(--accent)">
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Rival name="THE WIND" record="2 — 18 MPH" />
              <Rival name="A GOOD BACKHAND" record="404 NOT FOUND" />
              <Rival name="MY 6:00 AM ALARM" record="PUBLIC ENEMY #1" />
              <Rival name="THE BAKERY" record="OPEN 4 BIZ" />
            </ul>
          </Window>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tennis-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        border: "1px solid color-mix(in oklch, var(--neon-lime) 40%, transparent)",
        background: "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
      }}
    >
      <div className="tiny" style={{ color: "var(--fg-dim)" }}>
        {k}
      </div>
      <div
        className="font-display-tube"
        style={{
          fontSize: 14,
          color: "var(--neon-lime)",
          textShadow: "0 0 6px var(--neon-lime)",
        }}
      >
        {v}
      </div>
    </div>
  );
}

function Rival({ name, record }: { name: string; record: string }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom:
          "1px dashed color-mix(in oklch, var(--accent) 30%, transparent)",
      }}
    >
      <span className="font-display-tube" style={{ fontSize: 14 }}>
        {name}
      </span>
      <span className="tiny" style={{ color: "var(--accent)" }}>
        {record}
      </span>
    </li>
  );
}
