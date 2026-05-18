import Image from "next/image";
import Link from "next/link";
import profile from "@/public/static/images/profile.jpeg";
import StatusRow from "./ui/StatusRow";

export default function Home() {
  return (
    <div className="page-enter page-pad" style={{ paddingTop: 32 }}>
      <div
        className="eyebrow"
        style={{
          color: "var(--accent-2)",
          textShadow: "0 0 6px var(--accent-2)",
          marginBottom: 18,
        }}
      >
        {"// CHANNEL 00"}
      </div>

      <div
        className="home-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "minmax(110px, auto)",
          gap: 12,
        }}
      >
        <div
          className="home-grid-hero"
          style={{
            gridColumn: "span 8",
            gridRow: "span 3",
            padding: "30px 30px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border:
              "1px solid color-mix(in oklch, var(--accent) 55%, transparent)",
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--accent) 22%, var(--panel-1)) 0%, var(--panel-2) 70%)",
            boxShadow:
              "inset 0 0 32px color-mix(in oklch, var(--accent) 15%, transparent), 0 0 24px color-mix(in oklch, var(--accent) 20%, transparent)",
          }}
        >
          <div className="eyebrow" aria-hidden="true" style={{ visibility: "hidden" }}>
            ·
          </div>
          <h1
            className="font-display-tube chrome-text"
            style={{
              fontSize: "clamp(60px, 9vw, 140px)",
              margin: 0,
              lineHeight: 0.9,
            }}
          >
            HANS
            <br />
            KAMIN
          </h1>
          <div className="tiny home-trail" style={{ color: "var(--fg-dim)" }}>
            <span className="home-trail-full">
              NEW JERSEY → SAN LUIS OBISPO → MIAMI → NEW YORK CITY → AUSTIN
            </span>
            <span className="home-trail-short">
              NJ → SLO → MIA → NYC → ATX
            </span>
          </div>
        </div>

        <div
          className="home-grid-portrait"
          style={{ gridColumn: "span 4", gridRow: "span 3" }}
        >
          <div
            className="frame crt"
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              src={profile}
              alt="Hans"
              placeholder="blur"
              priority
              sizes="(min-width: 768px) 33vw, 100vw"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        <GridTile
          href="/music"
          label="01 / MUSIC"
          big="18 RELEASES"
          accent="var(--accent)"
          span={3}
        />
        <GridTile
          href="/software"
          label="02 / SOFTWARE"
          big="CURRENT WORK"
          accent="var(--accent-2)"
          span={3}
        />
        <GridTile
          href="/volunteering"
          label="03 / VOLUNTEERING"
          big="YOUTH EMPOWERMENT"
          accent="var(--accent-3)"
          span={3}
        />
        <GridTile
          href="/tennis"
          label="04 / TENNIS"
          big="PLAY PONG?"
          accent="var(--neon-lime)"
          span={3}
        />

        <div
          className="home-grid-status"
          style={{
            gridColumn: "span 12",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <StatusRow />
        </div>
      </div>

      <style>{`
        .home-grid .tiny,
        .home-grid .eyebrow {
          font-size: 14px;
          letter-spacing: 0.22em;
        }
        @media (max-width: 640px) {
          .home-grid-status .tiny {
            font-size: 10px;
            letter-spacing: 0.16em;
          }
        }
        .home-trail-short { display: none; }
        @media (max-width: 640px) {
          .home-trail-full { display: none; }
          .home-trail-short { display: inline; }
        }
        .channel-tile:hover {
          background: linear-gradient(160deg, color-mix(in oklch, var(--tile-accent) 35%, var(--panel-1)) 0%, var(--panel-2) 80%) !important;
          box-shadow: inset 0 0 28px color-mix(in oklch, var(--tile-accent) 25%, transparent),
                      0 0 24px color-mix(in oklch, var(--tile-accent) 35%, transparent) !important;
          transition: var(--t-fast);
        }
        @media (max-width: 767px) {
          .home-grid-hero,
          .home-grid-portrait,
          .home-grid .channel-tile,
          .home-grid-status {
            grid-column: span 12 !important;
          }
          .home-grid-hero,
          .home-grid-portrait {
            grid-row: auto !important;
          }
          .home-grid .channel-tile {
            grid-row: span 1 !important;
            min-height: 120px;
          }
          .home-grid-portrait {
            aspect-ratio: 4/3;
            max-height: 360px;
          }
        }
        @media (max-width: 640px) {
          .home-grid {
            gap: 10px !important;
          }
          .home-grid-hero {
            padding: 20px 18px 18px !important;
            gap: 16px;
          }
          .home-grid-hero h1 {
            font-size: clamp(44px, 16vw, 96px) !important;
          }
          .home-grid-portrait {
            aspect-ratio: 1/1;
            max-height: none;
          }
          .home-grid-status {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

function GridTile({
  href,
  label,
  big,
  accent,
  span = 3,
}: {
  href: string;
  label: string;
  big: string;
  accent: string;
  span?: number;
}) {
  const baseBg = `linear-gradient(160deg, color-mix(in oklch, ${accent} 20%, var(--panel-1)) 0%, var(--panel-2) 80%)`;
  return (
    <Link
      href={href}
      className="channel-tile flex flex-col justify-between"
      style={
        {
          gridColumn: `span ${span}`,
          gridRow: "span 2",
          padding: "16px 18px",
          border: `1px solid color-mix(in oklch, ${accent} 55%, transparent)`,
          background: baseBg,
          color: "var(--fg)",
          boxShadow: `inset 0 0 20px color-mix(in oklch, ${accent} 12%, transparent)`,
          ["--tile-accent" as string]: accent,
        } as React.CSSProperties
      }
    >
      <div className="eyebrow" style={{ color: accent }}>
        {label}
      </div>
      <div
        className="font-display-tube"
        style={{
          fontSize: 22,
          color: accent,
          textShadow: `0 0 12px ${accent}`,
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        {big}
      </div>
      <div className="tiny" style={{ color: "var(--fg-dim)" }}>
        ▸ ENTER ▸
      </div>
    </Link>
  );
}
