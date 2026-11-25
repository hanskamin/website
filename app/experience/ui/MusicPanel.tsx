"use client";

import type { CSSProperties } from "react";
import { RELEASES, fmtTime } from "../content";
import type { MusicPlayer } from "../useYouTube";

export default function MusicPanel({ music }: { music: MusicPlayer }) {
  const r = RELEASES[music.index];
  const pct = music.duration > 0 ? Math.min(100, (music.time / music.duration) * 100) : 0;

  return (
    <>
      <p className="lede">
        Available on all streaming platforms.
      </p>

      <section className="now" aria-label="Now playing">
        <div className="now-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={r.id}
            src={`https://i.ytimg.com/vi/${r.id}/maxresdefault.jpg`}
            alt={`Album art: ${r.title}`}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = `https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`;
              }
            }}
          />
        </div>
        <div className="now-main">
          {music.playing && <p className="label">Now playing</p>}
          <h2 className="now-title">{r.title}</h2>
          <p className="now-meta">Hans · {r.year}</p>

          <div className="seek">
            <span>{fmtTime(music.time)}</span>
            <input
              type="range"
              className="range"
              min={0}
              max={music.duration || 1}
              step={0.1}
              value={Math.min(music.time, music.duration || 1)}
              onChange={(e) => music.seek(parseFloat(e.target.value))}
              aria-label="Seek"
              style={{ "--p": `${pct}%` } as CSSProperties}
            />
            <span>{fmtTime(music.duration)}</span>
          </div>

          <div className="transport">
            <button type="button" className="tbtn" onClick={music.prev} aria-label="Previous track">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <rect x="5" y="5" width="3" height="14" fill="currentColor" />
                <path d="M20 5 L10 12 L20 19 Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="tbtn tbtn-play"
              onClick={music.toggle}
              aria-label={music.playing ? "Pause" : "Play"}
            >
              {music.playing ? (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
                </svg>
              )}
            </button>
            <button type="button" className="tbtn" onClick={music.next} aria-label="Next track">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 5 L14 12 L4 19 Z" fill="currentColor" />
                <rect x="16" y="5" width="3" height="14" fill="currentColor" />
              </svg>
            </button>
            <label className="volume">
              <span>Vol</span>
              <input
                type="range"
                className="range"
                min={0}
                max={100}
                step={1}
                value={music.volume}
                onChange={(e) => music.setVolume(parseInt(e.target.value, 10))}
                aria-label="Volume"
                style={{ "--p": `${music.volume}%` } as CSSProperties}
              />
            </label>
          </div>
        </div>
      </section>

      <section aria-label="Releases">
        <h2 className="section-title">
          Releases <span>{RELEASES.length}</span>
        </h2>
        <ol className="releases">
          {RELEASES.map((rel, i) => {
            const active = i === music.index;
            return (
              <li key={rel.id}>
                <button
                  type="button"
                  className="release"
                  aria-current={active ? "true" : undefined}
                  onClick={() => music.select(i)}
                >
                  <span className="release-no">
                    {active && music.playing ? "▸" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="release-title">{rel.title}</span>
                  <span className="release-dur">{fmtTime(rel.duration)}</span>
                  <span className="release-year">{rel.year}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
