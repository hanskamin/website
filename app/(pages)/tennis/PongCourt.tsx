"use client";

import { useEffect, useRef, useState } from "react";

const PADDLE_H = 0.18;
const PADDLE_W_PX = 6;
const BALL_PX = 12;
const PLAY_LEFT = 0.04;
const PLAY_RIGHT = 0.96;
const PLAY_TOP = 0.08;
const PLAY_BOTTOM = 0.92;
const PLAYER_X = PLAY_LEFT + 0.025;
const CPU_X = PLAY_RIGHT - 0.025;

const BALL_VX_START = 0.42;
const BALL_VX_MAX = 0.85;
const BALL_VX_GAIN = 1.05;
const PADDLE_SPEED_Y = 1.3;
const CPU_SPEED_Y = 0.82;
const CPU_DEMO_SPEED_Y = 0.85;
const CPU_DEAD_ZONE = 0.04;

const WIN_SCORE = 7;
const TAKEOVER_MS = 5000;
const POINT_PAUSE_MS = 700;
const GAME_PAUSE_MS = 2600;

type Score = { p: number; c: number };

export default function PongCourt() {
  const courtRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const cpuRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState<Score>({ p: 0, c: 0 });
  const [banner, setBanner] = useState<string | null>(null);

  const sRef = useRef({
    ball: { x: 0.5, y: 0.5, vx: BALL_VX_START, vy: 0.18 },
    playerY: 0.5,
    cpuY: 0.5,
    keys: { up: false, down: false },
    touchY: null as number | null,
    lastInputAt: 0,
    pauseUntil: 0,
    courtW: 0,
    courtH: 0,
  });

  useEffect(() => {
    const el = courtRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      sRef.current.courtW = r.width;
      sRef.current.courtH = r.height;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "w" || k === "W" || k === "ArrowUp") {
        sRef.current.keys.up = true;
        sRef.current.touchY = null;
        sRef.current.lastInputAt = performance.now();
        if (k === "ArrowUp") e.preventDefault();
      } else if (k === "s" || k === "S" || k === "ArrowDown") {
        sRef.current.keys.down = true;
        sRef.current.touchY = null;
        sRef.current.lastInputAt = performance.now();
        if (k === "ArrowDown") e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "w" || k === "W" || k === "ArrowUp")
        sRef.current.keys.up = false;
      else if (k === "s" || k === "S" || k === "ArrowDown")
        sRef.current.keys.down = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    const el = courtRef.current;
    if (!el) return;
    const follow = (clientY: number) => {
      const r = el.getBoundingClientRect();
      const y = (clientY - r.top) / r.height;
      sRef.current.touchY = Math.max(PLAY_TOP, Math.min(PLAY_BOTTOM, y));
      sRef.current.lastInputAt = performance.now();
    };
    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      follow(e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      const engaged =
        e.buttons > 0 || e.pressure > 0 || e.pointerType !== "mouse";
      if (engaged) follow(e.clientY);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    const local: Score = { p: 0, c: 0 };

    const serve = (dir: 1 | -1) => {
      const s = sRef.current;
      s.ball.x = 0.5;
      s.ball.y = 0.4 + Math.random() * 0.2;
      const angle = (Math.random() - 0.5) * 0.6;
      s.ball.vx = dir * BALL_VX_START;
      s.ball.vy = Math.sin(angle) * BALL_VX_START * 1.4;
      s.pauseUntil = performance.now() + POINT_PAUSE_MS;
    };

    const moveAi = (
      paddleY: number,
      targetY: number,
      speed: number,
      dt: number,
    ) => {
      const diff = targetY - paddleY;
      if (Math.abs(diff) < CPU_DEAD_ZONE) return paddleY;
      const step = speed * dt;
      return paddleY + Math.max(-step, Math.min(step, diff));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sRef.current;
      const paddleHalfH = PADDLE_H / 2;
      const minY = PLAY_TOP + paddleHalfH;
      const maxY = PLAY_BOTTOM - paddleHalfH;

      const humanActive = now - s.lastInputAt < TAKEOVER_MS;

      if (humanActive) {
        if (s.touchY != null) {
          const diff = s.touchY - s.playerY;
          const step = PADDLE_SPEED_Y * 1.6 * dt;
          s.playerY += Math.max(-step, Math.min(step, diff));
        } else {
          let dy = 0;
          if (s.keys.up) dy -= 1;
          if (s.keys.down) dy += 1;
          s.playerY += dy * PADDLE_SPEED_Y * dt;
        }
      } else {
        s.touchY = null;
        const demoTarget = s.ball.vx < 0 ? s.ball.y : 0.5;
        s.playerY = moveAi(s.playerY, demoTarget, CPU_DEMO_SPEED_Y, dt);
      }
      s.playerY = Math.max(minY, Math.min(maxY, s.playerY));
      const cpuTarget = s.ball.vx > 0 ? s.ball.y : 0.5;
      s.cpuY = moveAi(s.cpuY, cpuTarget, CPU_SPEED_Y, dt);
      s.cpuY = Math.max(minY, Math.min(maxY, s.cpuY));

      if (now >= s.pauseUntil) {
        s.ball.x += s.ball.vx * dt;
        s.ball.y += s.ball.vy * dt;

        const courtW = Math.max(1, s.courtW);
        const courtH = Math.max(1, s.courtH);
        const ballRX = BALL_PX / 2 / courtW;
        const ballRY = BALL_PX / 2 / courtH;
        const paddleHalfWX = PADDLE_W_PX / 2 / courtW + ballRX;
        const reachY = paddleHalfH + ballRY;

        if (s.ball.y - ballRY < PLAY_TOP) {
          s.ball.y = PLAY_TOP + ballRY;
          s.ball.vy = Math.abs(s.ball.vy);
        } else if (s.ball.y + ballRY > PLAY_BOTTOM) {
          s.ball.y = PLAY_BOTTOM - ballRY;
          s.ball.vy = -Math.abs(s.ball.vy);
        }

        if (
          s.ball.vx < 0 &&
          s.ball.x - ballRX < PLAYER_X + paddleHalfWX &&
          s.ball.x > PLAYER_X - paddleHalfWX &&
          Math.abs(s.ball.y - s.playerY) < reachY
        ) {
          const offset = (s.ball.y - s.playerY) / paddleHalfH;
          const newVx = Math.min(BALL_VX_MAX, Math.abs(s.ball.vx) * BALL_VX_GAIN);
          s.ball.vx = newVx;
          s.ball.vy = offset * newVx * 1.1;
          s.ball.x = PLAYER_X + paddleHalfWX;
        }
        if (
          s.ball.vx > 0 &&
          s.ball.x + ballRX > CPU_X - paddleHalfWX &&
          s.ball.x < CPU_X + paddleHalfWX &&
          Math.abs(s.ball.y - s.cpuY) < reachY
        ) {
          const offset = (s.ball.y - s.cpuY) / paddleHalfH;
          const newVx = Math.min(BALL_VX_MAX, Math.abs(s.ball.vx) * BALL_VX_GAIN);
          s.ball.vx = -newVx;
          s.ball.vy = offset * newVx * 1.1;
          s.ball.x = CPU_X - paddleHalfWX;
        }

        if (s.ball.x < PLAY_LEFT - 0.05) {
          local.c += 1;
          setScore({ ...local });
          if (local.c >= WIN_SCORE) {
            setBanner("CPU WINS");
            s.pauseUntil = now + GAME_PAUSE_MS;
            resetTimer = setTimeout(() => {
              local.p = 0;
              local.c = 0;
              setScore({ p: 0, c: 0 });
              setBanner(null);
              serve(-1);
            }, GAME_PAUSE_MS);
          } else {
            serve(1);
          }
        } else if (s.ball.x > PLAY_RIGHT + 0.05) {
          local.p += 1;
          setScore({ ...local });
          if (local.p >= WIN_SCORE) {
            setBanner("PLAYER WINS");
            s.pauseUntil = now + GAME_PAUSE_MS;
            resetTimer = setTimeout(() => {
              local.p = 0;
              local.c = 0;
              setScore({ p: 0, c: 0 });
              setBanner(null);
              serve(1);
            }, GAME_PAUSE_MS);
          } else {
            serve(-1);
          }
        }
      }

      const cw = s.courtW;
      const ch = s.courtH;
      if (cw && ch) {
        if (ballRef.current) {
          ballRef.current.style.transform = `translate(${s.ball.x * cw}px, ${
            s.ball.y * ch
          }px) translate(-50%, -50%)`;
        }
        if (playerRef.current) {
          playerRef.current.style.transform = `translate(${PLAYER_X * cw}px, ${
            s.playerY * ch
          }px) translate(-50%, -50%)`;
        }
        if (cpuRef.current) {
          cpuRef.current.style.transform = `translate(${CPU_X * cw}px, ${
            s.cpuY * ch
          }px) translate(-50%, -50%)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    serve(Math.random() < 0.5 ? 1 : -1);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div
      ref={courtRef}
      style={{
        aspectRatio: "23/10",
        position: "relative",
        background:
          "linear-gradient(180deg, oklch(0.64 0.16 42), oklch(0.50 0.17 36) 55%, oklch(0.42 0.16 34))",
        border: "2px solid var(--neon-lime)",
        boxShadow:
          "0 0 24px var(--neon-lime), inset 0 0 38px oklch(0.32 0.13 32)",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: "ns-resize",
      }}
    >
      {/* doubles court (baselines + doubles sidelines) */}
      <CourtLine style={{ inset: "8% 4%", border: "2px solid #fff" }} />
      {/* singles sidelines */}
      <CourtLine
        style={{
          left: "4%",
          right: "4%",
          top: "16%",
          height: 2,
          background: "#fff",
        }}
      />
      <CourtLine
        style={{
          left: "4%",
          right: "4%",
          bottom: "16%",
          height: 2,
          background: "#fff",
        }}
      />
      {/* service lines (vertical, between singles sidelines) */}
      <CourtLine
        style={{
          left: "27%",
          top: "16%",
          bottom: "16%",
          width: 2,
          background: "#fff",
        }}
      />
      <CourtLine
        style={{
          right: "27%",
          top: "16%",
          bottom: "16%",
          width: 2,
          background: "#fff",
        }}
      />
      {/* center service line (between service lines, passes under the net) */}
      <CourtLine
        style={{
          left: "27%",
          right: "27%",
          top: "calc(50% - 1px)",
          height: 2,
          background: "#fff",
        }}
      />
      {/* baseline center marks */}
      <CourtLine
        style={{
          left: "4%",
          top: "calc(50% - 1px)",
          width: 12,
          height: 2,
          background: "#fff",
        }}
      />
      <CourtLine
        style={{
          right: "4%",
          top: "calc(50% - 1px)",
          width: 12,
          height: 2,
          background: "#fff",
        }}
      />
      {/* net */}
      <CourtLine
        style={{
          left: "50%",
          top: "8%",
          bottom: "8%",
          width: 3,
          background: "var(--accent)",
          boxShadow: "0 0 12px var(--accent)",
        }}
      />

      <div
        ref={playerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PADDLE_W_PX,
          height: `${PADDLE_H * 100}%`,
          background: "var(--neon-lime)",
          boxShadow: "0 0 14px var(--neon-lime)",
          willChange: "transform",
          zIndex: 3,
        }}
      />
      <div
        ref={cpuRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PADDLE_W_PX,
          height: `${PADDLE_H * 100}%`,
          background: "var(--accent-2)",
          boxShadow: "0 0 14px var(--accent-2)",
          willChange: "transform",
          zIndex: 3,
        }}
      />
      <div
        ref={ballRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: BALL_PX,
          height: BALL_PX,
          borderRadius: "50%",
          background: "var(--neon-lime)",
          boxShadow: "0 0 12px var(--neon-lime)",
          willChange: "transform",
          zIndex: 3,
        }}
      />

      <div
        className="tiny"
        style={{
          position: "absolute",
          left: 12,
          top: 10,
          color: "var(--neon-lime)",
          textShadow: "0 0 8px var(--neon-lime)",
          letterSpacing: ".2em",
          zIndex: 4,
        }}
      >
        PLAYER {String(score.p).padStart(2, "0")}
      </div>
      <div
        className="tiny"
        style={{
          position: "absolute",
          right: 12,
          top: 10,
          color: "var(--accent-2)",
          textShadow: "0 0 8px var(--accent-2)",
          letterSpacing: ".2em",
          zIndex: 4,
        }}
      >
        CPU {String(score.c).padStart(2, "0")}
      </div>

      <div
        className="tiny"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 8,
          transform: "translateX(-50%)",
          color: "#fff",
          opacity: 0.55,
          letterSpacing: ".2em",
          zIndex: 4,
          whiteSpace: "nowrap",
        }}
      >
        ▸ W/S OR ↑↓ · DRAG ON TOUCH ▸ FIRST TO {WIN_SCORE}
      </div>

      {banner && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            zIndex: 10,
            background: "rgba(8, 6, 22, 0.72)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            boxShadow:
              "inset 0 0 48px color-mix(in oklch, var(--neon-lime) 30%, transparent)",
            animation: "page-in .25s ease-out both",
          }}
        >
          <div
            className="eyebrow"
            style={{
              color: "var(--accent-2)",
              textShadow: "0 0 8px var(--accent-2)",
              letterSpacing: ".35em",
            }}
          >
            ▸ GAME ▸ FINAL
          </div>
          <div
            className="font-display-tube"
            style={{
              fontSize: "clamp(44px, 9vw, 104px)",
              color: "var(--neon-lime)",
              textShadow:
                "0 0 14px var(--neon-lime), 0 0 32px var(--neon-lime)",
              letterSpacing: ".08em",
              lineHeight: 1,
            }}
          >
            {banner}
          </div>
          <div
            className="tiny"
            style={{
              color: "var(--fg-dim)",
              letterSpacing: ".25em",
            }}
          >
            {String(score.p).padStart(2, "0")} —{" "}
            {String(score.c).padStart(2, "0")} ▸ RESTARTING
          </div>
        </div>
      )}
    </div>
  );
}

function CourtLine({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", ...style }} />;
}
