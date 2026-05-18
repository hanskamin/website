"use client";

import { useEffect, useState } from "react";
import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";

export default function ContactPage() {
  const [signal, setSignal] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSignal((s) => (s + 1) % 8), 220);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 05"
        title="CONTACT"
        sub="If you're reading this, let's connect!"
        subGridTemplate="minmax(0, 1.2fr) minmax(0, 1fr)"
      />

      <div
        className="contact-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigLink
            href="https://linkedin.com/in/hanskamin"
            label="LINKEDIN"
            sub="/in/hanskamin"
            accent="var(--accent-2)"
          />
          <BigLink
            href="https://github.com/hanskamin"
            label="GITHUB"
            sub="/hanskamin"
            accent="var(--accent)"
          />
          <BigLink
            href="https://linktr.ee/hanzykamin"
            label="STREAMING"
            sub="hans · everywhere"
            accent="var(--accent-3)"
          />
          <BigLink
            href="mailto:hansjkamin@gmail.com"
            label="E-MAIL"
            sub="hansjkamin@gmail.com"
            accent="var(--neon-lime)"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Window title="signal.mon" accent="var(--accent)">
            <div className="eyebrow">▸ SIGNAL STRENGTH</div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 12,
                alignItems: "end",
                height: 64,
              }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${20 + Math.abs(Math.sin((i + signal) * 0.6)) * 80}%`,
                    background: `color-mix(in oklch, var(--accent) ${30 + (i % 4) * 18}%, transparent)`,
                    boxShadow:
                      i % 3 === 0 ? "0 0 8px var(--accent)" : "none",
                  }}
                />
              ))}
            </div>
            <div
              className="tiny"
              style={{ color: "var(--fg-dim)", marginTop: 14 }}
            >
              ▸ FREQ 88.6 FM ▸ LOCATION: 40.7128°N, 74.0060°W
            </div>
          </Window>

          <Window
            title="visitor.log"
            accent="var(--accent-2)"
            style={{ flex: 1 }}
          >
            <div
              style={{
                fontFamily: "var(--body-stack)",
                fontSize: 12,
                color: "var(--fg-dim)",
                lineHeight: 1.9,
              }}
            >
              <div>
                <span style={{ color: "var(--accent-2)" }}>{">"}</span> connection
                established
              </div>
              <div>
                <span style={{ color: "var(--accent-2)" }}>{">"}</span>{" "}
                authenticating...{" "}
                <span style={{ color: "var(--neon-lime)" }}>ok</span>
              </div>
              <div>
                <span style={{ color: "var(--accent-2)" }}>{">"}</span> welcome,
                traveler
              </div>
              <div>
                <span style={{ color: "var(--accent-2)" }}>{">"}</span> thanks for
                stopping by ▮
              </div>
            </div>
          </Window>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .big-link {
            padding: 16px 18px !important;
            gap: 12px;
          }
          .big-link .big-link-label {
            font-size: 22px !important;
          }
          .big-link .big-link-arrow {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}

function BigLink({
  href,
  label,
  sub,
  accent,
}: {
  href: string;
  label: string;
  sub: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="big-link"
      style={
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 24px",
          border: `1px solid color-mix(in oklch, ${accent} 55%, transparent)`,
          background: `linear-gradient(90deg, color-mix(in oklch, ${accent} 22%, var(--panel-1)) 0%, var(--panel-2) 70%)`,
          color: "var(--fg)",
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          boxShadow: `inset 0 0 18px color-mix(in oklch, ${accent} 10%, transparent)`,
          ["--link-accent" as string]: accent,
        } as React.CSSProperties
      }
    >
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div
          className="font-display-tube big-link-label"
          style={{
            fontSize: 32,
            color: accent,
            textShadow: `0 0 12px ${accent}`,
          }}
        >
          {label}
        </div>
        <div
          className="tiny"
          style={{
            color: "var(--fg-dim)",
            marginTop: 4,
            wordBreak: "break-word",
          }}
        >
          {sub}
        </div>
      </div>
      <div
        className="font-display-tube big-link-arrow"
        style={{ fontSize: 28, color: accent, flexShrink: 0 }}
      >
        ▸
      </div>
      <style>{`
        .big-link:hover {
          background: linear-gradient(90deg, color-mix(in oklch, var(--link-accent) 38%, var(--panel-1)) 0%, var(--panel-2) 70%) !important;
          box-shadow: inset 0 0 24px color-mix(in oklch, var(--link-accent) 22%, transparent),
                      0 0 28px color-mix(in oklch, var(--link-accent) 40%, transparent) !important;
          transition: var(--t-fast);
        }
      `}</style>
    </a>
  );
}
