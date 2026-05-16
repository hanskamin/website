"use client";

import { useState } from "react";
import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";
import Placeholder from "@/app/ui/Placeholder";

const RELEASES = [
  {
    title: "be honest",
    year: 2024,
    link: "https://distrokid.com/hyperfollow/hans14/be-honest-2",
    duration: "3:24",
    color: "var(--accent)",
  },
  {
    title: "wrong?right!",
    year: 2024,
    link: "https://distrokid.com/hyperfollow/hans14/wrongright-feat-jani",
    duration: "2:58",
    color: "var(--accent-2)",
  },
  {
    title: "again&again",
    year: 2023,
    link: "https://distrokid.com/hyperfollow/hans14/againagain-feat-plxsko",
    duration: "3:11",
    color: "var(--accent-3)",
  },
  {
    title: "in medias res",
    year: 2022,
    link: "https://distrokid.com/hyperfollow/hans14/in-medias-res",
    duration: "4:02",
    color: "var(--neon-lime)",
  },
];

export default function MusicPage() {
  const [playing, setPlaying] = useState(0);
  const r = RELEASES[playing];

  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 01"
        title="MUSIC"
        sub="Solo work released independently since 2022. Streamable wherever you listen."
      />

      <div
        className="music-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        <Window title="releases.dir" accent="var(--accent)">
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {RELEASES.map((rel, i) => (
              <li
                key={rel.title}
                onMouseEnter={() => setPlaying(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr auto auto",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom:
                    "1px dashed color-mix(in oklch, var(--accent) 30%, transparent)",
                }}
              >
                <div
                  className="font-display-tube"
                  style={{
                    color: rel.color,
                    textShadow: `0 0 8px ${rel.color}`,
                    fontSize: 18,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <a
                  href={rel.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display-tube glitch"
                  data-text={rel.title}
                  style={{
                    color: "var(--fg)",
                    fontSize: 28,
                    letterSpacing: ".02em",
                    textDecoration: "none",
                  }}
                >
                  {rel.title}
                </a>
                <span className="tiny" style={{ color: "var(--fg-dim)" }}>
                  {rel.duration}
                </span>
                <span className="tag pink">{rel.year}</span>
              </li>
            ))}
          </ol>
        </Window>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Window title="now.playing" accent="var(--accent-2)">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Placeholder label="album art" ratio="1/1" accent={r.color} />
              <div>
                <div
                  className="font-display-tube"
                  style={{
                    color: r.color,
                    fontSize: 26,
                    textShadow: `0 0 10px ${r.color}`,
                  }}
                >
                  {r.title}
                </div>
                <div
                  className="tiny"
                  style={{ color: "var(--fg-dim)", marginTop: 4 }}
                >
                  HANS · {r.year}
                </div>
              </div>
              <Equalizer color={r.color} />
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  ▸ STREAM
                </a>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPlaying((playing + 1) % RELEASES.length)}
                >
                  NEXT ▸
                </button>
              </div>
            </div>
          </Window>

          <Window title="tape.deck" accent="var(--accent-3)">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <TapeReel />
              <div style={{ flex: 1 }}>
                <div className="tiny" style={{ color: "var(--fg-dim)" }}>
                  SIDE A
                </div>
                <div
                  className="font-display-tube"
                  style={{ fontSize: 16, color: "var(--accent-3)" }}
                >
                  HANS — MIX &rsquo;24
                </div>
                <div
                  style={{
                    height: 4,
                    background: "rgba(0,0,0,.45)",
                    marginTop: 12,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 60% 0 0",
                      background: "var(--accent-3)",
                      boxShadow: "0 0 8px var(--accent-3)",
                    }}
                  />
                </div>
              </div>
              <TapeReel reverse />
            </div>
          </Window>
        </div>
      </div>

      <style>{`
        @keyframes eqBar { from { transform: scaleY(.2); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .music-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Equalizer({ color }: { color: string }) {
  const bars = 24;
  return (
    <div
      style={{ display: "flex", alignItems: "end", gap: 3, height: 40 }}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: `eqBar ${0.6 + (i % 5) * 0.18}s ease-in-out ${i * 0.04}s infinite alternate`,
            height: `${20 + ((i * 37) % 80)}%`,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

function TapeReel({ reverse }: { reverse?: boolean }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "2px solid color-mix(in oklch, var(--accent-3) 60%, transparent)",
        position: "relative",
        animation: `spin 2.2s linear infinite ${reverse ? "reverse" : ""}`,
        background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,.6) 31%)",
      }}
      aria-hidden="true"
    >
      {[0, 60, 120].map((a) => (
        <span
          key={a}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 2,
            height: 22,
            background: "var(--accent-3)",
            transform: `translate(-50%, -100%) rotate(${a}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 0 6px var(--accent-3)",
          }}
        />
      ))}
    </div>
  );
}
