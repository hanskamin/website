"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ViewId } from "./three/constants";
import type { WorldHandle } from "./three/world";
import type { Call, GameSnapshot } from "./three/game";
import { RELEASES, STACK, TIMELINE, VOL_PHOTOS } from "./content";
import { useYouTube } from "./useYouTube";
import HomeHud from "./ui/HomeHud";
import Panel from "./ui/Panel";
import MusicPanel from "./ui/MusicPanel";
import SoftwarePanel from "./ui/SoftwarePanel";
import VolunteeringPanel from "./ui/VolunteeringPanel";
import MatchHud from "./ui/MatchHud";

const VIEWS: Record<string, ViewId> = {
  "/": "home",
  "/music": "music",
  "/software": "software",
  "/volunteering": "volunteering",
  "/play": "play",
};

const AREA = {
  music: "Music",
  software: "Software",
  volunteering: "Volunteering",
} as const;

function photoUrl(src: string, w: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

export default function Experience() {
  const pathname = usePathname();
  const router = useRouter();
  const view: ViewId = VIEWS[pathname.replace(/\/$/, "") || "/"] ?? "home";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [world, setWorld] = useState<WorldHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [snap, setSnap] = useState<GameSnapshot | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoHold, setPhotoHold] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const music = useYouTube();
  const viewRef = useRef(view);
  viewRef.current = view;

  // Build the 3D world once.
  useEffect(() => {
    let disposed = false;
    let handle: WorldHandle | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    import("./three/world")
      .then(({ createWorld }) => {
        if (disposed) return;
        const small = window.innerWidth < 820;
        handle = createWorld(canvas, {
          monitors: TIMELINE.map((t) => ({ year: t.year, role: t.role, co: t.co })),
          stack: STACK.map((s) =>
            s.tag === "FRONT" || s.tag === "BACK"
              ? s.label.toUpperCase()
              : `${s.tag} ${s.label.toUpperCase()}`,
          ),
          photos: VOL_PHOTOS.map((p) => photoUrl(p.src, small ? 828 : 1200)),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onPick: (kind, index) => {
            if (kind === "monitor") setRoleIdx(index);
            else {
              setPhotoIdx(index);
              setPhotoHold((n) => n + 1);
            }
          },
          onGameState: setSnap,
          onCall: setCall,
          onReady: () => setReady(true),
        });
        handle.setView(viewRef.current, true);
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __world?: WorldHandle }).__world = handle;
        }
        setWorld(handle);
      })
      .catch(() => {
        if (disposed) return;
        setFailed(true);
        setReady(true);
      });
    return () => {
      disposed = true;
      handle?.dispose();
      setWorld(null);
    };
  }, []);

  // Fly the camera when the route changes.
  const lastView = useRef<ViewId | null>(null);
  useEffect(() => {
    if (!world) return;
    world.setView(view);
    if (view === "play") {
      world.game.setMode("match");
    } else if (lastView.current === "play" || lastView.current === null) {
      world.game.setMode("demo");
      world.sfx.setAmbience(false);
    }
    lastView.current = view;
    setExpanded(false);
  }, [world, view]);

  // Keep the subject clear of the content panel.
  useEffect(() => {
    if (!world) return;
    const apply = () => {
      const w = window.innerWidth;
      const area = view === "music" || view === "software" || view === "volunteering";
      const home = view === "home";
      if (window.innerHeight <= 480) {
        // Phone held sideways: the panel is on the right.
        world.setInsets(area ? 0.56 : 0, home ? 0.24 : 0);
      } else if (w < 860) {
        // Phone upright: the panel is a bottom sheet.
        world.setInsets(0, area ? 0.56 : home ? 0.42 : 0);
      } else if (area) {
        world.setInsets((Math.min(560, Math.max(400, w * 0.42)) + 24) / w, 0);
      } else {
        world.setInsets(0, home ? 0.2 : 0);
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [world, view]);

  // Mirror UI state into the scene.
  const track = RELEASES[music.index];
  useEffect(() => {
    world?.setMusic({
      playing: music.playing,
      index: music.index,
      title: track.title,
      year: track.year,
      videoId: track.id,
      total: RELEASES.length,
    });
  }, [world, music.playing, music.index, track]);
  useEffect(() => world?.setMonitor(roleIdx), [world, roleIdx]);
  useEffect(() => world?.setPhoto(photoIdx), [world, photoIdx]);
  useEffect(() => world?.sfx.setMuted(muted), [world, muted]);

  const { enable, select } = music;
  useEffect(() => {
    if (view === "music") enable();
  }, [view, enable]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("play");
    const idx = id ? RELEASES.findIndex((r) => r.id === id) : -1;
    if (idx >= 0) select(idx);
  }, [select]);

  // The photographs change on their own until the visitor picks one.
  useEffect(() => {
    if (view !== "volunteering") return;
    const t = window.setInterval(
      () => setPhotoIdx((i) => (i + 1) % VOL_PHOTOS.length),
      photoHold ? 9000 : 4200,
    );
    return () => window.clearInterval(t);
  }, [view, photoHold]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewRef.current !== "home") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const pickPhoto = useCallback((i: number) => {
    setPhotoIdx(i);
    setPhotoHold((n) => n + 1);
  }, []);

  const area = view === "music" || view === "software" || view === "volunteering" ? view : null;

  return (
    <div className={`xp view-${view}${ready ? " is-ready" : ""}`}>
      <div className={`stage${failed ? " stage-fallback" : ""}`}>
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <div className="shade" aria-hidden="true" />

      <header className="topbar">
        {view === "home" ? (
          <div className="bug">
            <span className="bug-live">Live</span>
            <span className="bug-text">Centre Court</span>
          </div>
        ) : (
          <Link href="/" className="back">
            <span aria-hidden="true">◂</span> Centre Court
          </Link>
        )}
        <div className="topbar-right">
          {music.playing && view !== "music" && (
            <Link href="/music" className="chip chip-live">
              <span className="eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="chip-text">{track.title}</span>
            </Link>
          )}
          {view === "play" && (
            <button
              type="button"
              className="chip"
              aria-pressed={muted}
              onClick={() => setMuted((m) => !m)}
            >
              Sound {muted ? "off" : "on"}
            </button>
          )}
        </div>
      </header>

      {view === "home" && <HomeHud />}

      {area && (
        <Panel
          key={area}
          title={AREA[area]}
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        >
          {area === "music" && <MusicPanel music={music} />}
          {area === "software" && <SoftwarePanel selected={roleIdx} onSelect={setRoleIdx} />}
          {area === "volunteering" && (
            <VolunteeringPanel index={photoIdx} onSelect={pickPhoto} />
          )}
        </Panel>
      )}

      {view === "play" && (
        <MatchHud world={world} snap={snap} call={call} failed={failed} />
      )}

      <div className="yt-host" aria-hidden="true">
        <div ref={music.hostRef} />
      </div>

      <div className="loader" aria-hidden={ready}>
        <div className="loader-ball" />
      </div>
    </div>
  );
}
