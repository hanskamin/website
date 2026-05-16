"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHead from "@/app/ui/SectionHead";
import Window from "@/app/ui/Window";

type Release = {
  id: string;
  title: string;
  duration: number;
  year: number;
  color: string;
};

const RELEASES: Release[] = [
  { id: "rUI_9sBqF0A", title: "be honest", duration: 175, year: 2025, color: "var(--accent)" },
  { id: "piqTQ05Y2D4", title: "ecstasy", duration: 157, year: 2025, color: "var(--accent-2)" },
  { id: "tAFd44lLvlw", title: "which one?", duration: 214, year: 2025, color: "var(--accent-3)" },
  { id: "uKDIPkeDfdw", title: "ten hot riyas (interlude)", duration: 102, year: 2025, color: "var(--neon-lime)" },
  { id: "wkXxbZN7h0w", title: "your love (feat. chudi)", duration: 204, year: 2025, color: "var(--accent)" },
  { id: "XzgzMsvlPgQ", title: "fall, pt. 1", duration: 153, year: 2025, color: "var(--accent-2)" },
  { id: "s9Mludt5h1E", title: "fall, pt. 2", duration: 174, year: 2025, color: "var(--accent-3)" },
  { id: "P5J33jUvH50", title: "four in the morning", duration: 165, year: 2025, color: "var(--neon-lime)" },
  { id: "mhJjE6NAqOI", title: "be honest", duration: 175, year: 2024, color: "var(--accent)" },
  { id: "2qLDs9z-ZZ8", title: "wrong?right! (feat. jani!)", duration: 252, year: 2024, color: "var(--accent-2)" },
  { id: "8HtK9Vs00Bk", title: "again & again (feat. Plxsko)", duration: 251, year: 2023, color: "var(--accent-3)" },
  { id: "HlEBc6z5vWY", title: "catharsis", duration: 237, year: 2022, color: "var(--neon-lime)" },
  { id: "ktWTkrJkTv0", title: "delirium", duration: 195, year: 2022, color: "var(--accent)" },
  { id: "4vFp1wUGEd8", title: "lucidity", duration: 226, year: 2022, color: "var(--accent-2)" },
  { id: "tofxYahutzo", title: "alive", duration: 190, year: 2022, color: "var(--accent-3)" },
  { id: "8luFsd2kpPA", title: "catharsis remix (feat. Chudi)", duration: 237, year: 2022, color: "var(--neon-lime)" },
  { id: "AXl2DcJ9C18", title: "on X (feat. Plxsko)", duration: 162, year: 2021, color: "var(--accent)" },
  { id: "YXAX2tRAXqs", title: "Catharsis", duration: 225, year: 2021, color: "var(--accent-2)" },
];

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (id: string) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (v: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type YTPlayerState = {
  ENDED: number;
  PLAYING: number;
  PAUSED: number;
  BUFFERING: number;
  CUED: number;
};

type YTApi = {
  Player: new (
    el: HTMLElement | string,
    opts: Record<string, unknown>,
  ) => YTPlayer;
  PlayerState: YTPlayerState;
};

declare global {
  interface Window {
    YT: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function MusicPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(RELEASES[0].duration);
  const [volume, setVolume] = useState(80);
  const [isReady, setIsReady] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingIdxRef = useRef<number | null>(null);

  const r = RELEASES[currentIdx];

  const loadAndPlay = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setCurrentTime(0);
    setDuration(RELEASES[idx].duration);
    const p = playerRef.current;
    if (p && typeof p.loadVideoById === "function") {
      try {
        p.loadVideoById(RELEASES[idx].id);
      } catch {
        pendingIdxRef.current = idx;
      }
    } else {
      pendingIdxRef.current = idx;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("play");
    if (!id) return;
    const idx = RELEASES.findIndex((rel) => rel.id === id);
    if (idx < 0) return;
    loadAndPlay(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = () => {
      if (!mounted || !playerHostRef.current || playerRef.current) return;
      playerRef.current = new window.YT.Player(playerHostRef.current, {
        height: "1",
        width: "1",
        videoId: RELEASES[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (!mounted) return;
            setIsReady(true);
            try {
              e.target.setVolume(volume);
              const d = e.target.getDuration();
              if (d) setDuration(d);
            } catch {}
            if (pendingIdxRef.current != null) {
              const idx = pendingIdxRef.current;
              pendingIdxRef.current = null;
              try { e.target.loadVideoById(RELEASES[idx].id); } catch {}
            }
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (!mounted) return;
            const s = e.data;
            if (s === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              try {
                const d = e.target.getDuration();
                if (d) setDuration(d);
              } catch {}
            } else if (s === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (s === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setCurrentIdx((i) => {
                const next = (i + 1) % RELEASES.length;
                setCurrentTime(0);
                setDuration(RELEASES[next].duration);
                try { playerRef.current?.loadVideoById(RELEASES[next].id); } catch {}
                return next;
              });
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      init();
    } else {
      const tagId = "yt-iframe-api";
      if (!document.getElementById(tagId)) {
        const tag = document.createElement("script");
        tag.id = tagId;
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        init();
      };
    }

    return () => {
      mounted = false;
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = () => {
      const p = playerRef.current;
      if (p) {
        try {
          const t = p.getCurrentTime();
          if (Number.isFinite(t)) setCurrentTime(t);
          const d = p.getDuration();
          if (d) setDuration((prev) => (Math.abs(prev - d) > 0.5 ? d : prev));
        } catch {}
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (isPlaying) p.pauseVideo();
      else p.playVideo();
    } catch {}
  }, [isPlaying]);

  const goPrev = useCallback(() => {
    loadAndPlay((currentIdx - 1 + RELEASES.length) % RELEASES.length);
  }, [currentIdx, loadAndPlay]);

  const goNext = useCallback(() => {
    loadAndPlay((currentIdx + 1) % RELEASES.length);
  }, [currentIdx, loadAndPlay]);

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    try { playerRef.current?.seekTo(value, true); } catch {}
  }, []);

  const onVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    setVolume(v);
    try { playerRef.current?.setVolume(v); } catch {}
  }, []);

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="page-enter page-pad">
      <SectionHead
        kicker="// CHANNEL 01"
        title="MUSIC"
        sub="Solo work released independently since 2021. Streamable wherever you listen."
      />

      <div
        className="music-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "stretch",
        }}
      >
        <Window
          title={`releases.dir [${RELEASES.length}]`}
          accent="var(--accent)"
          style={{ minHeight: 0 }}
        >
          <div style={{ position: "relative", height: "100%", minHeight: 0 }}>
            <ol
              style={{
                position: "absolute",
                inset: 0,
                margin: 0,
                padding: 0,
                listStyle: "none",
                overflowY: "auto",
              }}
              className="releases-scroll"
            >
            {RELEASES.map((rel, i) => {
              const active = i === currentIdx;
              return (
                <li
                  key={rel.id}
                  onClick={() => loadAndPlay(i)}
                  aria-current={active ? "true" : undefined}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 12px",
                    borderBottom:
                      "1px dashed color-mix(in oklch, var(--accent) 30%, transparent)",
                    cursor: "pointer",
                    background: active
                      ? "color-mix(in oklch, var(--accent) 14%, transparent)"
                      : "transparent",
                    boxShadow: active
                      ? "inset 0 0 18px color-mix(in oklch, var(--accent) 30%, transparent)"
                      : "none",
                    transition: "background var(--t-fast)",
                  }}
                >
                  <div
                    className="font-display-tube"
                    style={{
                      color: active ? rel.color : "var(--fg-dim)",
                      textShadow: active ? `0 0 8px ${rel.color}` : "none",
                      fontSize: 16,
                    }}
                    aria-hidden="true"
                  >
                    {active && isPlaying ? "▸" : String(i + 1).padStart(2, "0")}
                  </div>
                  <span
                    className="font-display-tube glitch"
                    data-text={rel.title}
                    style={{
                      color: "var(--fg)",
                      fontSize: 22,
                      letterSpacing: ".02em",
                      lineHeight: 1.15,
                    }}
                  >
                    {rel.title}
                  </span>
                  <span className="tiny" style={{ color: "var(--fg-dim)" }}>
                    {fmtTime(rel.duration)}
                  </span>
                  <span className="tag pink">{rel.year}</span>
                </li>
              );
            })}
            </ol>
          </div>
        </Window>

        <Window title="now.playing" accent="var(--accent-2)">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                className="frame crt"
                style={{ aspectRatio: "1/1", position: "relative" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${r.id}/maxresdefault.jpg`}
                  alt={`Album art — ${r.title}`}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = "1";
                      img.src = `https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`;
                    }
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {!isReady && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(0,0,0,0.4)",
                      color: r.color,
                      fontFamily: "var(--display-stack)",
                      fontSize: 12,
                      letterSpacing: "0.3em",
                      textShadow: `0 0 8px ${r.color}`,
                    }}
                  >
                    LOADING…
                  </div>
                )}
              </div>

              <div>
                <div
                  className="font-display-tube"
                  style={{
                    color: r.color,
                    fontSize: 24,
                    textShadow: `0 0 10px ${r.color}`,
                    lineHeight: 1.1,
                  }}
                >
                  {r.title}
                </div>
                <div
                  className="tiny"
                  style={{ color: "var(--fg-dim)", marginTop: 6 }}
                >
                  HANS · {r.year}
                </div>
              </div>

              <Equalizer color={r.color} active={isPlaying} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <span
                  className="tiny"
                  style={{
                    color: r.color,
                    minWidth: 40,
                    textAlign: "right",
                    textShadow: `0 0 6px ${r.color}`,
                  }}
                >
                  {fmtTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={onSeek}
                  aria-label="Seek"
                  className="hk-range"
                  style={
                    {
                      flex: 1,
                      ["--p" as string]: `${pct}%`,
                      ["--c" as string]: r.color,
                    } as React.CSSProperties
                  }
                />
                <span
                  className="tiny"
                  style={{ color: "var(--fg-dim)", minWidth: 40 }}
                >
                  {fmtTime(duration)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={goPrev}
                  aria-label="Previous track"
                  style={{ padding: "10px 16px", letterSpacing: "0.1em" }}
                >
                  ◄◄
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={!isReady}
                  style={{
                    minWidth: 110,
                    justifyContent: "center",
                    padding: "14px 24px",
                    fontSize: 14,
                    opacity: isReady ? 1 : 0.55,
                  }}
                >
                  {isPlaying ? "❚❚ PAUSE" : "▸ PLAY"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={goNext}
                  aria-label="Next track"
                  style={{ padding: "10px 16px", letterSpacing: "0.1em" }}
                >
                  ►►
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 2,
                }}
              >
                <span className="tiny" style={{ color: "var(--fg-dim)" }}>
                  VOL
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={onVolume}
                  aria-label="Volume"
                  className="hk-range"
                  style={
                    {
                      flex: 1,
                      ["--p" as string]: `${volume}%`,
                      ["--c" as string]: "var(--accent-2)",
                    } as React.CSSProperties
                  }
                />
                <span
                  className="tiny"
                  style={{
                    color: "var(--accent-2)",
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {volume}
                </span>
              </div>
            </div>
        </Window>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div ref={playerHostRef} />
      </div>

      <style>{`
        @keyframes eqBar { from { transform: scaleY(.2); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
        @media (max-width: 900px) {
          .music-grid { grid-template-columns: 1fr !important; }
        }
        .releases-scroll::-webkit-scrollbar { width: 8px; }
        .releases-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); }
        .releases-scroll::-webkit-scrollbar-thumb {
          background: color-mix(in oklch, var(--accent) 55%, transparent);
          box-shadow: 0 0 8px color-mix(in oklch, var(--accent) 60%, transparent);
        }
        .releases-scroll li:hover {
          background: color-mix(in oklch, var(--accent) 8%, transparent) !important;
        }
        .releases-scroll li[aria-current="true"]:hover {
          background: color-mix(in oklch, var(--accent) 20%, transparent) !important;
        }
        .hk-range {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: linear-gradient(
            to right,
            var(--c) 0%,
            var(--c) var(--p),
            rgba(0,0,0,0.55) var(--p),
            rgba(0,0,0,0.55) 100%
          );
          border: 1px solid color-mix(in oklch, var(--c) 40%, transparent);
          border-radius: 2px;
          outline: none;
          box-shadow: 0 0 8px color-mix(in oklch, var(--c) 40%, transparent);
          cursor: pointer;
        }
        .hk-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: var(--c);
          border: 1px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px var(--c);
          cursor: pointer;
        }
        .hk-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--c);
          border: 1px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px var(--c);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Equalizer({ color, active }: { color: string; active: boolean }) {
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
            animation: active
              ? `eqBar ${0.6 + (i % 5) * 0.18}s ease-in-out ${i * 0.04}s infinite alternate`
              : "none",
            height: active ? `${20 + ((i * 37) % 80)}%` : "18%",
            opacity: active ? 1 : 0.35,
            borderRadius: 1,
            transition: "opacity 200ms, height 200ms",
          }}
        />
      ))}
    </div>
  );
}

