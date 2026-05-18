"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";
import mun1 from "@/public/static/images/mun1.jpeg";
import cona from "@/public/static/images/cona.jpeg";
import mun0 from "@/public/static/images/mun0.jpeg";
import conaSunset from "@/public/static/images/cona-sunset.jpeg";

const VOL_IMAGES: StaticImageData[] = [mun1, cona, mun0, conaSunset];

export default function VolunteeringPage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % VOL_IMAGES.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 03"
        title="VOLUNTEERING"
        sub="Mentoring high schoolers through the YMCA Model United Nations program."
        subGridTemplate="minmax(0, 1fr) minmax(0, 1fr)"
      />

      <div
        className="vol-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        <div>
          {/* Stacked image carousel */}
          <div className="vol-carousel" style={{ position: "relative", aspectRatio: "4/5" }}>
            {VOL_IMAGES.map((src, i) => (
              <div
                key={i}
                className="frame"
                style={{
                  position: "absolute",
                  inset: 0,
                  transform:
                    i === idx
                      ? "rotate(0deg) scale(1)"
                      : `rotate(${(i - idx) * 3}deg) scale(.97)`,
                  opacity: i === idx ? 1 : 0.25,
                  transition: "all 1s cubic-bezier(.2,.7,.2,1)",
                  zIndex: i === idx ? 5 : 1,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  placeholder="blur"
                  sizes="(min-width: 900px) 40vw, 100vw"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
            <div
              className="tiny"
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                zIndex: 10,
                color: "var(--accent-3)",
                textShadow: "0 0 8px var(--accent-3)",
              }}
            >
              ▸ FRAME {String(idx + 1).padStart(2, "0")} /{" "}
              {String(VOL_IMAGES.length).padStart(2, "0")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 16,
              justifyContent: "center",
            }}
          >
            {VOL_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`frame ${i + 1}`}
                style={{
                  width: 24,
                  height: 6,
                  borderRadius: 1,
                  border: 0,
                  background:
                    i === idx
                      ? "var(--accent-3)"
                      : "color-mix(in oklch, var(--accent-3) 25%, transparent)",
                  boxShadow: i === idx ? "0 0 8px var(--accent-3)" : "none",
                  transition: "var(--t-fast)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Window title="program.dat" accent="var(--accent-3)">
            <p
              style={{
                color: "var(--fg)",
                fontSize: 14,
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              When I was in high school, competing in the YMCA Model
              United Nations debate program in Hershey, PA was the most
              formative growth opportunity I had the privilege of experiencing.
              Since 2018, I&rsquo;ve been fortunate enough to volunteer
              alongside other program alumni as a leadership staff member,
              mentoring high schoolers as they navigate the myriad challenges
              associated with organizing, executing, and competing in a debate
              competition with peers from all over the tri-state area.
            </p>
          </Window>

          <Window title="trip.director" accent="var(--accent)">
            <p
              style={{
                color: "var(--fg)",
                fontSize: 14,
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              I have the distinct honor of serving as a national trip director
              for the program&rsquo;s most impressive participants. Each
              summer, I chaperone our 25 best & brightest students to the{" "}
              <a
                href="https://ymcacona.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                Conference on National Affairs
              </a>{" "}
              in Blue Ridge, NC.
            </p>
            <p
              style={{
                color: "var(--fg-dim)",
                fontSize: 13,
                lineHeight: 1.85,
                margin: "12px 0 0",
              }}
            >
              Our students spend an entire week meeting, befriending, and
              debating high schoolers from a wide variety of upbringings,
              backgrounds, and ways of life that are completely different from
              their own. American politics are as vitriolic as ever -- I believe
              it&rsquo;s never been more important for young people to learn
              how to empathize & engage with belief systems that challenge
              their own, and I find immense joy in facilitating that
              opportunity for them every year.
            </p>
          </Window>

        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .vol-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .vol-grid { gap: 20px !important; }
          .vol-carousel { aspect-ratio: 4/4 !important; }
        }
      `}</style>
    </div>
  );
}

