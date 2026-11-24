"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorldHandle } from "../three/world";
import type { Call, GameSnapshot } from "../three/game";
import { TENNIS_RIVALS, TENNIS_SPECS } from "../content";

const STICK_R = 54;

export default function MatchHud({
  world,
  snap,
  call,
  failed,
}: {
  world: WorldHandle | null;
  snap: GameSnapshot | null;
  call: Call | null;
  failed: boolean;
}) {
  const [touch, setTouch] = useState(false);
  const [knob, setKnob] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null);
  const stick = useRef<{ id: number; ox: number; oy: number } | null>(null);
  const keys = useRef({ l: false, r: false, u: false, d: false });

  const inMatch = snap?.mode === "match";
  const phase = inMatch ? snap.phase : "idle";
  const live = inMatch && phase !== "idle" && phase !== "over";

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const swing = useCallback(() => world?.game.swing(), [world]);

  // Keyboard: WASD or arrows to move, Space to toss, serve and swing.
  useEffect(() => {
    if (!world || !live) return;
    const k = keys.current;
    const push = () =>
      world.game.setInput((k.r ? 1 : 0) - (k.l ? 1 : 0), (k.u ? 1 : 0) - (k.d ? 1 : 0));
    const set = (e: KeyboardEvent, down: boolean) => {
      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          k.l = down;
          break;
        case "KeyD":
        case "ArrowRight":
          k.r = down;
          break;
        case "KeyW":
        case "ArrowUp":
          k.u = down;
          break;
        case "KeyS":
        case "ArrowDown":
          k.d = down;
          break;
        case "Space":
        case "Enter":
        case "KeyJ":
          if (down && !e.repeat) world.game.swing();
          break;
        default:
          return;
      }
      e.preventDefault();
      push();
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      k.l = k.r = k.u = k.d = false;
      world.game.setInput(0, 0);
    };
  }, [world, live]);

  const start = () => {
    if (!world) return;
    world.sfx.unlock();
    world.sfx.setAmbience(true);
    world.game.startMatch();
  };

  // Touch: the left half of the screen is a floating stick, the right half swings.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!world) return;
    if (e.pointerType === "mouse") {
      if (e.button === 0) swing();
      return;
    }
    if (e.clientX < window.innerWidth * 0.5 && !stick.current) {
      stick.current = { id: e.pointerId, ox: e.clientX, oy: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      setKnob({ ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 });
    } else {
      swing();
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stick.current;
    if (!world || !s || s.id !== e.pointerId) return;
    let dx = e.clientX - s.ox;
    let dy = e.clientY - s.oy;
    const len = Math.hypot(dx, dy);
    if (len > STICK_R) {
      dx = (dx / len) * STICK_R;
      dy = (dy / len) * STICK_R;
    }
    const dead = len < 8 ? 0 : 1;
    world.game.setInput((dx / STICK_R) * dead, (-dy / STICK_R) * dead);
    setKnob({ ox: s.ox, oy: s.oy, dx, dy });
  };
  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stick.current;
    if (!s || s.id !== e.pointerId) return;
    stick.current = null;
    world?.game.setInput(0, 0);
    setKnob(null);
  };

  const act = touch ? "Tap Swing" : "Press Space";
  const hint =
    phase === "serve"
      ? `${act} to toss the ball.${snap?.serveNo === 2 ? " Second serve." : ""}`
      : phase === "toss"
        ? `${act} again at the top of the toss. Hold left or right to aim.`
        : phase === "rally"
          ? "Run to the yellow ring. Swing as the ball arrives. Hold a direction to aim."
          : "";

  const won = snap?.winner === "mac";

  return (
    <div className="match">
      {live && (
        <div
          className="touch-layer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />
      )}

      {inMatch && phase !== "idle" && (
        <div className="scorebug" role="status" aria-live="polite">
          <div className="sb-head">
            <span>Fifth set</span>
            <span>Games</span>
            <span>Points</span>
          </div>
          <div className="sb-row">
            <span className="sb-name">
              <i /> Borg
            </span>
            <span className="sb-games">7</span>
            <span className="sb-pts">{snap.labels.borg}</span>
          </div>
          <div className="sb-row">
            <span className="sb-name">
              <i className="on" /> McEnroe
            </span>
            <span className="sb-games">6</span>
            <span className="sb-pts">{snap.labels.mac}</span>
          </div>
        </div>
      )}

      {live && call && (
        <div className={`call call-${call.tone}`} role="status" aria-live="assertive" key={call.title + call.sub}>
          <strong>{call.title}</strong>
          <span>{call.sub}</span>
        </div>
      )}

      {live && hint && !call && <p className="hint">{hint}</p>}

      {live && touch && (
        <>
          {knob ? (
            <div className="stick" style={{ left: knob.ox, top: knob.oy }}>
              <i style={{ transform: `translate(${knob.dx}px, ${knob.dy}px)` }} />
            </div>
          ) : (
            <div className="stick stick-rest">
              <i />
              <span>Move</span>
            </div>
          )}
          <div className="swing-pad" aria-hidden="true">
            Swing
          </div>
        </>
      )}

      {phase === "idle" && (
        <div className="card" role="dialog" aria-label="Play match">
          <p className="kicker">Centre Court · 5 July 1980 · Final</p>
          <h1>Play match</h1>
          {failed ? (
            <p className="prose">
              This browser cannot start 3D graphics, so the match cannot be played here.
            </p>
          ) : (
            <>
              <p className="prose">
                Fifth set. Borg leads 7 games to 6. You are McEnroe, and it is your serve.
                Win this one game to stay in the final.
              </p>
              <ul className="controls">
                <li>
                  <b>Move</b>
                  {touch ? "Left thumb: drag anywhere" : "W A S D or arrow keys"}
                </li>
                <li>
                  <b>Serve</b>
                  {touch ? "Tap right: toss. Tap again: hit" : "Space: toss. Space again: hit"}
                </li>
                <li>
                  <b>Swing</b>
                  {touch ? "Tap the right side" : "Space or click"}
                </li>
                <li>
                  <b>Aim</b>
                  Hold a direction while you hit
                </li>
              </ul>
              <div className="card-actions">
                <button type="button" className="btn btn-primary" onClick={start} disabled={!world}>
                  {world ? "Walk on court" : "Loading…"}
                </button>
                <Link href="/" className="btn">
                  Back
                </Link>
              </div>
            </>
          )}
          <details className="about-tennis">
            <summary>Hans and tennis</summary>
            <p className="prose">
              A lifelong obsession. I picked up a racquet for the first time at 5 years old,
              and I&rsquo;ll never give it up. You can often find me on any public courts,
              either after sunrise or before sunset.
            </p>
            <p className="prose prose-dim">
              A crisp forehand down the line is my favorite shot. No better feeling. Never
              date a tennis player -- Love means nothing to them ;)
            </p>
            <dl className="specs">
              {TENNIS_SPECS.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
            <ul className="rivals">
              {TENNIS_RIVALS.map((r) => (
                <li key={r.name}>
                  <span>{r.name}</span>
                  <span>{r.record}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {phase === "over" && (
        <div className="card card-result" role="dialog" aria-label="Result">
          <p className="kicker">{won ? "Seven games all" : "1–6, 7–5, 6–3, 6–7, 8–6"}</p>
          <h1>{won ? "Game, McEnroe" : "Game, set and match, Borg"}</h1>
          <p className="prose">
            {won
              ? "You held serve against Borg on Centre Court. The fifth set goes on."
              : "The same result as 5 July 1980. Borg wins his fifth title in a row."}
          </p>
          <div className="card-actions">
            <button type="button" className="btn btn-primary" onClick={start}>
              Play again
            </button>
            <Link href="/" className="btn">
              Back to Centre Court
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
