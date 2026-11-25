import * as THREE from "three";
import * as K from "./constants";
import { PlayerRig, type AnimName } from "./players";
import { netHeightAt } from "./stadium";

export type Who = "nadal" | "federer";
export type Mode = "demo" | "match";
export type Phase = "idle" | "serve" | "toss" | "rally" | "point" | "over";
export type Call = { title: string; sub: string; tone: "good" | "bad" | "neutral" };
export type SoundName = "hit" | "serve" | "bounce" | "net" | "applause" | "gasp";

export type GameSnapshot = {
  mode: Mode;
  phase: Phase;
  points: Record<Who, number>;
  labels: Record<Who, string>;
  serveNo: 1 | 2;
  winner: Who | null;
};

export type GameListener = {
  onState: (s: GameSnapshot) => void;
  onCall: (c: Call | null) => void;
  onSound: (name: SoundName, volume: number) => void;
  onCheer: (amount: number) => void;
};

type Plan = {
  tc: number;
  sx: number;
  sz: number;
  side: "fh" | "bh";
  swung: boolean;
  /** How much of the available running time the shot needs. Above 1: out of reach. */
  effort: number;
};

type Actor = {
  id: Who;
  rig: PlayerRig;
  x: number;
  z: number;
  vx: number;
  vz: number;
  face: 1 | -1;
  lefty: boolean;
  cpu: boolean;
  maxSpeed: number;
  err: number;
  goalX: number;
  goalZ: number;
  plan: Plan | null;
  reactAt: number;
};

const E = 0.72;
const F = 0.74;
const REACH = 1.25;
const g = K.GRAVITY;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const gauss = () => {
  let u = 0;
  for (let i = 0; i < 4; i++) u += Math.random();
  return (u - 2) * 1.73;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const other = (w: Who): Who => (w === "nadal" ? "federer" : "nadal");

export function pointLabels(p: number, c: number): [string, string] {
  if (p >= 3 && c >= 3) {
    if (p === c) return ["40", "40"];
    return p > c ? ["AD", "40"] : ["40", "AD"];
  }
  const base = ["0", "15", "30", "40"];
  return [base[Math.min(p, 3)], base[Math.min(c, 3)]];
}

export class Game {
  mode: Mode = "demo";
  phase: Phase = "idle";
  points: Record<Who, number> = { nadal: 0, federer: 0 };
  serveNo: 1 | 2 = 1;
  winner: Who | null = null;
  now = 0;

  ball = {
    p: new THREE.Vector3(0, 1, 12),
    v: new THREE.Vector3(),
    state: "held" as "held" | "toss" | "live" | "dead",
    lastHit: "nadal" as Who,
    bounces: 0,
    isServe: false,
    touched: false,
  };
  marker = { visible: false, x: 0, z: 0 };
  nadal: Actor;
  federer: Actor;

  private input = { x: 0, y: 0 };
  /** Shots the CPU has hit this point. Long rallies make it miss more. */
  private cpuShots = 0;
  private nextAt = 0;
  private serveReadyAt = 0;
  private tossAt = 0;
  private tossApexAt = 0;
  private tossApexH = 3.2;
  private serveHitAt = 0;
  private serveContactAt = 0;
  private swingBusyUntil = 0;
  private contactFrom = 0;
  private contactTo = 0;
  private keepServeNo = false;

  constructor(
    rigs: { nadal: PlayerRig; federer: PlayerRig },
    private listener: GameListener,
  ) {
    const actor = (id: Who, rig: PlayerRig, face: 1 | -1): Actor => ({
      id,
      rig,
      x: 0,
      z: -face * 13,
      vx: 0,
      vz: 0,
      face,
      lefty: rig.look.lefty,
      cpu: true,
      maxSpeed: 6.2,
      err: 1,
      goalX: 0,
      goalZ: -face * 13,
      plan: null,
      reactAt: 0,
    });
    this.nadal = actor("nadal", rigs.nadal, -1);
    this.federer = actor("federer", rigs.federer, 1);
    this.setMode("demo");
  }

  // ── Public controls ────────────────────────────────────────────────────

  setMode(mode: Mode) {
    this.mode = mode;
    this.points = { nadal: 0, federer: 0 };
    this.winner = null;
    this.serveNo = 1;
    this.listener.onCall(null);
    this.marker.visible = false;
    if (mode === "demo") {
      this.nadal.cpu = true;
      this.nadal.maxSpeed = 4.5;
      this.federer.maxSpeed = 4.5;
      this.federer.err = 1;
      this.startPoint();
    } else {
      // Wait at the baseline until the visitor starts the game.
      this.nadal.cpu = false;
      this.nadal.maxSpeed = 6.8;
      this.federer.maxSpeed = 4.1;
      this.federer.err = 1.15;
      this.phase = "idle";
      this.ball.state = "held";
      this.nadal.plan = this.federer.plan = null;
      this.nadal.rig.stop();
      this.federer.rig.stop();
      this.placeForServe();
    }
    this.emit();
  }

  startMatch() {
    this.mode = "match";
    this.points = { nadal: 0, federer: 0 };
    this.winner = null;
    this.serveNo = 1;
    this.listener.onCall(null);
    this.startPoint();
    this.emit();
  }

  /** x: right is positive. y: toward the net is positive. */
  setInput(x: number, y: number) {
    this.input.x = clamp(x, -1, 1);
    this.input.y = clamp(y, -1, 1);
  }

  /** The single action button: toss, serve, or swing. */
  swing() {
    if (this.mode !== "match" || this.nadal.cpu) return;
    if (this.phase === "serve") {
      if (Math.hypot(this.nadal.x - this.nadal.goalX, this.nadal.z - this.nadal.goalZ) < 4.2) {
        this.beginToss();
      }
      return;
    }
    if (this.phase === "toss") {
      if (this.ball.state === "toss" && !this.serveContactAt) this.serveHit();
      return;
    }
    if (this.phase !== "rally" || this.now < this.swingBusyUntil) return;
    const a = this.nadal;
    const b = this.ball;
    const near = a.z < 6 && b.bounces === 0;
    const speed = near ? 1.4 : 1;
    const racketSide = a.lefty ? a.face : -a.face;
    // Choose the stroke from where the ball will be, not where it is.
    const lead = clamp(Math.abs(b.p.z - a.z) / Math.max(4, Math.abs(b.v.z)), 0, 0.5);
    const bx = b.p.x + b.v.x * lead;
    const side: AnimName = Math.sign(bx - a.x || racketSide) === racketSide ? "fh" : "bh";
    a.rig.play(side, speed);
    this.contactFrom = this.now + 0.08 / speed;
    this.contactTo = this.now + 0.42 / speed;
    this.swingBusyUntil = this.now + 0.52 / speed;
  }

  snapshot(): GameSnapshot {
    const [m, b] = pointLabels(this.points.nadal, this.points.federer);
    return {
      mode: this.mode,
      phase: this.phase,
      points: { ...this.points },
      labels: { nadal: m, federer: b },
      serveNo: this.serveNo,
      winner: this.winner,
    };
  }

  private emit() {
    this.listener.onState(this.snapshot());
  }

  // ── Point flow ─────────────────────────────────────────────────────────

  private serveSide() {
    const deuce = (this.points.nadal + this.points.federer) % 2 === 0;
    // Where the server (Nadal) stands, as an x sign.
    return (deuce ? 1 : -1) * -this.nadal.face;
  }

  private placeForServe() {
    const sx = this.serveSide();
    this.nadal.goalX = sx * 1.2;
    this.nadal.goalZ = K.HALF_LEN + 0.65;
    this.federer.goalX = -sx * 3.1;
    this.federer.goalZ = -(K.HALF_LEN + 0.9);
  }

  private startPoint() {
    if (!this.keepServeNo) this.serveNo = 1;
    this.keepServeNo = false;
    this.phase = "serve";
    this.ball.state = "held";
    this.ball.bounces = 0;
    this.nadal.plan = this.federer.plan = null;
    this.cpuShots = 0;
    this.serveContactAt = 0;
    this.serveHitAt = 0;
    this.marker.visible = false;
    this.placeForServe();
    this.serveReadyAt = this.now + 1.3;
    this.emit();
  }

  private beginToss() {
    this.phase = "toss";
    this.tossAt = this.now;
    this.serveContactAt = 0;
    this.serveHitAt = 0;
    this.nadal.rig.play("toss");
    this.emit();
  }

  private serveHit() {
    this.nadal.rig.play("serveHit");
    this.serveContactAt = this.now + PlayerRig.contactTime("serveHit");
  }

  private launch(tx: number, tz: number, T: number, clearNet: boolean) {
    const b = this.ball;
    for (let i = 0; i < 14; i++) {
      b.v.set(
        (tx - b.p.x) / T,
        (K.BALL_R - b.p.y + 0.5 * g * T * T) / T,
        (tz - b.p.z) / T,
      );
      if (!clearNet) break;
      const tn = -b.p.z / b.v.z;
      if (tn <= 0 || tn >= T) break;
      const yn = b.p.y + b.v.y * tn - 0.5 * g * tn * tn;
      const xn = b.p.x + b.v.x * tn;
      if (yn > netHeightAt(xn) + K.BALL_R + 0.16) break;
      T += 0.06;
    }
  }

  private doServe(a: Actor, q: number, aim: number) {
    const b = this.ball;
    const second = this.serveNo === 2;
    const box = -this.serveSide();
    if (q < 0.1) {
      // A mistimed swing: straight into the net.
      this.launch(box * 1.5, a.face * 0.5, 0.6, false);
    } else {
      const sigma = (0.13 + (1 - q) * 0.95) * (second ? 0.45 : 1);
      let tx = box * 2.05 + aim * 1.55;
      tx = box * clamp(tx * box, 0.4, 3.75);
      tx += gauss() * sigma;
      const tz = a.face * (K.SERVICE_Z - 1.0 + gauss() * sigma * 1.1);
      const T = (second ? 0.82 : 0.58) + (1 - q) * 0.24;
      this.launch(tx, tz, T, q > 0.3);
    }
    b.state = "live";
    b.lastHit = a.id;
    b.bounces = 0;
    b.isServe = true;
    b.touched = false;
    this.phase = "rally";
    this.listener.onSound("serve", 0.9);
    this.planFor(a.id === "nadal" ? this.federer : this.nadal);
    this.emit();
  }

  private fault(reason: string) {
    this.ball.state = "dead";
    this.marker.visible = false;
    if (this.serveNo === 1) {
      this.serveNo = 2;
      this.keepServeNo = true;
      this.phase = "point";
      this.nextAt = this.now + 1.9;
      this.listener.onCall({
        title: "FAULT",
        sub: `${reason} · second serve`,
        tone: "neutral",
      });
      this.emit();
    } else {
      this.award(other(this.ball.lastHit), "DOUBLE FAULT");
    }
  }

  private award(who: Who, title: string, close = false) {
    const b = this.ball;
    b.state = "dead";
    this.marker.visible = false;
    this.points[who]++;
    this.nadal.plan = this.federer.plan = null;
    const { nadal, federer } = this.points;
    let sub: string;
    let won: Who | null = null;
    if (nadal >= 4 && nadal - federer >= 2) won = "nadal";
    else if (federer >= 4 && federer - nadal >= 2) won = "federer";
    if (won) sub = `Game, ${won === "nadal" ? "Nadal" : "Federer"}`;
    else if (nadal >= 3 && federer >= 3) {
      sub = nadal === federer ? "Deuce" : `Advantage ${nadal > federer ? "Nadal" : "Federer"}`;
    } else {
      const names = ["Love", "15", "30", "40"];
      sub = nadal === federer ? `${names[nadal]} all` : `${names[nadal]} – ${names[federer]}`;
    }
    if (close && this.mode === "match" && who === "federer") sub = "Hawk-Eye confirms the call";
    this.winner = won;
    this.phase = "point";
    this.nextAt = this.now + (won ? 3.2 : 2.7);
    const tone = this.mode === "demo" ? "neutral" : who === "nadal" ? "good" : "bad";
    this.listener.onCall({ title, sub, tone });
    this.listener.onCheer(won ? 1 : 0.7);
    this.listener.onSound("applause", won ? 1 : 0.7);
    this.emit();
  }

  private landingOk(x: number, z: number): { ok: boolean; reason: string } {
    const b = this.ball;
    const targetSide = b.lastHit === "nadal" ? -1 : 1;
    if (Math.sign(z) !== targetSide) return { ok: false, reason: "NET" };
    const r = K.BALL_R;
    if (b.isServe) {
      const box = -this.serveSide();
      if (Math.abs(z) > K.SERVICE_Z + r) return { ok: false, reason: "Long" };
      if (x * box < -r || Math.abs(x) > K.SINGLES_W + r) return { ok: false, reason: "Wide" };
      return { ok: true, reason: "" };
    }
    if (Math.abs(x) > K.SINGLES_W + r) return { ok: false, reason: "WIDE" };
    if (Math.abs(z) > K.HALF_LEN + r) return { ok: false, reason: "LONG" };
    return { ok: true, reason: "" };
  }

  // ── Prediction and the computer player ─────────────────────────────────

  /**
   * Where the live ball will first bounce, and a good place to meet it.
   * @param atZ the depth at which the receiver wants to make contact
   */
  private predict(atZ?: number) {
    const b = this.ball;
    const disc = b.v.y * b.v.y + 2 * g * (b.p.y - K.BALL_R);
    if (disc < 0) return null;
    const t = (b.v.y + Math.sqrt(disc)) / g;
    let net = false;
    if (b.v.z !== 0) {
      const tn = -b.p.z / b.v.z;
      if (tn > 0 && tn < t) {
        const yn = b.p.y + b.v.y * tn - 0.5 * g * tn * tn;
        const xn = b.p.x + b.v.x * tn;
        if (Math.abs(xn) < K.NET_POST_X && yn < netHeightAt(xn) + K.BALL_R * 0.6) net = true;
      }
    }
    const bx = b.p.x + b.v.x * t;
    const bz = b.p.z + b.v.z * t;
    const vy = -(b.v.y - g * t) * E;
    const vx = b.v.x * F;
    const vz = b.v.z * F;
    // Meet the ball where the receiver stands if it gets there at a playable
    // height. If not, move to it before the second bounce.
    const apex = vy / g;
    let tauMax = Math.max(0.14, apex * 1.7);
    const limit = K.ARENA_Z - 1.3;
    if (Math.abs(vz) > 0.01) tauMax = Math.min(tauMax, Math.max(0.1, (limit - Math.abs(bz)) / Math.abs(vz)));
    let tau = apex * 1.05;
    if (atZ !== undefined && Math.abs(vz) > 0.5) tau = (atZ - bz) / vz;
    tau = clamp(tau, Math.min(0.14, tauMax), tauMax);
    return {
      net,
      t,
      bx,
      bz,
      tc: t + tau,
      cx: bx + vx * tau,
      cz: bz + vz * tau,
    };
  }

  private planFor(a: Actor) {
    a.plan = null;
    const pr = this.predict(a.z + a.face * 0.25);
    const human = !a.cpu;
    if (human) this.marker.visible = false;
    if (!pr || pr.net) return;
    if (Math.sign(pr.bz) !== -a.face) return;
    if (human) {
      this.marker.visible = true;
      this.marker.x = pr.bx;
      this.marker.z = pr.bz;
      return;
    }
    if (!this.landingOk(pr.bx, pr.bz).ok) return;
    const racketSide = a.lefty ? a.face : -a.face;
    const fhX = pr.cx - racketSide * 0.8;
    const bhX = pr.cx + racketSide * 0.65;
    const useFh = Math.abs(fhX - a.x) - 0.5 < Math.abs(bhX - a.x);
    const react = this.ball.isServe ? rnd(0.26, 0.36) : rnd(0.16, 0.28);
    const sx = clamp(useFh ? fhX : bhX, -K.ARENA_X + 0.8, K.ARENA_X - 0.8);
    const sz = pr.cz - a.face * 0.25;
    a.plan = {
      tc: this.now + pr.tc,
      sx,
      sz,
      side: useFh ? "fh" : "bh",
      swung: false,
      effort: Math.hypot(sx - a.x, sz - a.z) / (Math.max(0.2, pr.tc - react) * a.maxSpeed),
    };
    a.reactAt = this.now + react;
  }

  private cpuShot(a: Actor, stretch: number) {
    const o = a.id === "nadal" ? this.federer : this.nadal;
    const vsHuman = !o.cpu;
    // Now and then, go for the lines. Against a visitor, Federer plays with more
    // margin and more loop, which gives time to reach the ball.
    const bold = Math.random() < (vsHuman ? 0.1 : 0.3);
    const wide = vsHuman ? (bold ? 3.2 : 2.7) : bold ? 3.85 : 3.45;
    let tx: number;
    if (Math.random() < 0.62) tx = (o.x >= 0 ? -1 : 1) * rnd(1.6, wide);
    else tx = rnd(-2.4, 2.4);
    let depth = rnd(7.6, bold ? 11.3 : 10.9);
    const T =
      (bold ? rnd(0.9, 1.06) : rnd(1.2, 1.48)) + stretch * 0.25 + (vsHuman ? 0.3 : 0);
    const sigma = (0.6 + stretch * 1.0 + (bold ? 0.1 : 0)) * a.err;
    tx += gauss() * sigma;
    depth += gauss() * sigma * 1.2;
    // Against a visitor, Federer makes unforced errors, more as the rally gets long.
    const n = this.cpuShots++;
    const miss = vsHuman ? 0.06 + Math.min(0.14, n * 0.012) + stretch * 0.08 : 0;
    const roll = Math.random();
    if (roll < miss * 0.5) {
      // Long or wide.
      if (Math.random() < 0.55) depth = rnd(K.HALF_LEN + 0.35, K.HALF_LEN + 1.5);
      else tx = (tx >= 0 ? 1 : -1) * rnd(K.SINGLES_W + 0.3, K.SINGLES_W + 1.1);
      this.launch(tx, a.face * depth, T, true);
    } else if (
      roll < miss ||
      Math.random() < 0.012 * a.err + stretch * 0.06 + (bold ? 0.02 : 0)
    ) {
      this.launch(tx, a.face * 1.2, 0.75, false);
    } else {
      this.launch(tx, a.face * depth, T, true);
    }
    this.struck(a, 0.55 + stretch * 0.1);
  }

  private humanShot(a: Actor, q: number) {
    const b = this.ball;
    const ix = this.input.x;
    const iy = this.input.y;
    const volley = b.bounces === 0 && a.z < 6.5;
    let tx = Math.abs(ix) < 0.15 ? clamp(b.p.x * 0.35 + gauss() * 0.5, -2.5, 2.5) : ix * 3.15;
    let depth = iy > 0.3 ? 10.4 : iy < -0.3 ? 5.0 : 9.0;
    let T = 1.0 + (1 - q) * 0.45 - (iy > 0.3 ? 0.08 : 0) + (iy < -0.3 ? 0.14 : 0);
    if (volley) {
      T = 0.8;
      depth = iy < -0.3 ? 4.2 : 8.4;
    }
    // A clean hit is accurate. A stretched one sprays.
    const sigma = 0.18 + (1 - q) * 0.85 + (Math.abs(ix) > 0.6 ? 0.06 : 0) + (iy > 0.3 ? 0.12 : 0);
    tx += gauss() * sigma;
    depth += gauss() * sigma * 1.2;
    if (Math.random() < Math.max(0, 0.5 - q) * 0.5) {
      this.launch(tx, a.face * 1.2, 0.7, false);
    } else {
      this.launch(tx, a.face * Math.max(1.5, depth), T, true);
    }
    this.struck(a, 0.6 + q * 0.3);
  }

  private struck(a: Actor, volume: number) {
    const b = this.ball;
    b.lastHit = a.id;
    b.bounces = 0;
    b.isServe = false;
    b.touched = true;
    b.state = "live";
    a.plan = null;
    this.listener.onSound("hit", volume);
    this.planFor(a.id === "nadal" ? this.federer : this.nadal);
  }

  private canHit(a: Actor) {
    const b = this.ball;
    return (
      b.state === "live" &&
      b.lastHit !== a.id &&
      Math.sign(b.p.z) === -a.face &&
      b.bounces <= 1 &&
      !(b.isServe && b.bounces === 0)
    );
  }

  // ── Per-frame update ───────────────────────────────────────────────────

  update(dt: number) {
    dt = Math.min(dt, 0.05);
    this.now += dt;
    const now = this.now;
    const b = this.ball;

    if (this.phase === "serve" && this.nadal.cpu) {
      const ready =
        Math.hypot(this.nadal.x - this.nadal.goalX, this.nadal.z - this.nadal.goalZ) < 0.3 &&
        Math.hypot(this.federer.x - this.federer.goalX, this.federer.z - this.federer.goalZ) < 0.6;
      if (now > this.serveReadyAt && (ready || now > this.serveReadyAt + 2.5)) this.beginToss();
    }

    if (this.phase === "toss") {
      const a = this.nadal;
      if (b.state === "held" && now >= this.tossAt + 0.3) {
        a.rig.offHandPosition(b.p);
        b.p.y = Math.max(b.p.y, 1.7);
        b.p.x = a.x + (a.lefty ? -0.12 : 0.12) * a.face;
        b.p.z = a.z + a.face * 0.42;
        const vy = Math.sqrt(2 * g * (this.tossApexH - b.p.y));
        b.v.set(0, vy, a.face * 0.12);
        b.state = "toss";
        this.tossApexAt = now + vy / g;
        if (a.cpu) {
          this.serveHitAt =
            this.tossApexAt - PlayerRig.contactTime("serveHit") + rnd(0.0, 0.07);
        }
      }
      if (b.state === "toss") {
        if (a.cpu && this.serveHitAt && now >= this.serveHitAt && !this.serveContactAt) {
          this.serveHit();
        }
        if (this.serveContactAt && now >= this.serveContactAt) {
          const drop = this.tossApexH - b.p.y;
          const q = a.cpu ? rnd(0.5, 1) : clamp(1 - (drop - 0.35) / 0.95, 0, 1);
          this.doServe(a, q, a.cpu ? rnd(-0.9, 0.9) : this.input.x);
        } else if (!this.serveContactAt && b.p.y < 1.25 && b.v.y < 0) {
          // Let the toss drop: no penalty, go again.
          a.rig.stop();
          b.state = "held";
          this.phase = "serve";
          this.serveReadyAt = now + 0.6;
          this.emit();
        }
      }
    }

    if (this.phase === "point" && now >= this.nextAt) {
      this.listener.onCall(null);
      if (this.winner) {
        if (this.mode === "demo") {
          this.points = { nadal: 0, federer: 0 };
          this.winner = null;
          this.startPoint();
        } else {
          this.phase = "over";
          this.emit();
        }
      } else {
        this.startPoint();
      }
    }

    this.updateActor(this.nadal, dt);
    this.updateActor(this.federer, dt);

    // The visitor's swing meets the ball inside the contact window. An early
    // swing waits for the ball to arrive, so that timing is forgiving.
    if (!this.nadal.cpu && now >= this.contactFrom && now <= this.contactTo && this.canHit(this.nadal)) {
      const a = this.nadal;
      const dx = b.p.x - a.x;
      const dz = b.p.z - a.z - a.face * 0.25;
      const arrived = dz * -a.face >= -0.3;
      const last = now + dt > this.contactTo;
      if (Math.abs(dx) < 1.8 && Math.abs(dz) < 1.55 && b.p.y < 2.9 && (arrived || last)) {
        // Full quality anywhere inside a comfortable hitting zone.
        const offX = Math.max(0, Math.abs(dx) - 1.1) / 0.7;
        const offZ = Math.max(0, Math.abs(dz) - 0.8) / 0.75;
        let q = clamp(1 - Math.max(offX, offZ), 0, 1);
        if (b.p.y < 0.22 || b.p.y > 2.2) q *= 0.75;
        this.contactTo = 0;
        this.marker.visible = false;
        this.humanShot(a, q);
      }
    }

    // Ball.
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) this.stepBall(h);

    this.nadal.rig.update(dt, this.nadal.x, this.nadal.z, this.nadal.vx, this.nadal.vz, this.nadal.face, b.p);
    this.federer.rig.update(dt, this.federer.x, this.federer.z, this.federer.vx, this.federer.vz, this.federer.face, b.p);
    if (b.state === "held") {
      this.nadal.rig.root.updateMatrixWorld(true);
      this.nadal.rig.offHandPosition(b.p);
      b.v.set(0, 0, 0);
    }
  }

  private updateActor(a: Actor, dt: number) {
    const now = this.now;
    let wantX = 0;
    let wantZ = 0;
    const human = !a.cpu;
    const free = human && this.phase === "rally";

    if (free) {
      wantX = this.input.x * a.maxSpeed;
      wantZ = -this.input.y * a.maxSpeed;
    } else {
      let gx = a.goalX;
      let gz = a.goalZ;
      let top = a.maxSpeed;
      if (a.plan && now >= a.reactAt) {
        gx = a.plan.sx;
        gz = a.plan.sz;
      } else if (this.phase === "rally") {
        // Recover toward the middle of the baseline.
        gx = clamp(this.ball.p.x * 0.18, -1.5, 1.5);
        gz = -a.face * (K.HALF_LEN + 1.3);
        top = a.maxSpeed * 0.6;
      } else {
        top = 3.4;
        if (human && this.phase === "serve") {
          // The server may shuffle along the baseline before the toss.
          const sx = this.serveSide();
          a.goalX = clamp(a.goalX + this.input.x * 3 * dt, Math.min(sx * 0.35, sx * 3.9), Math.max(sx * 0.35, sx * 3.9));
          gx = a.goalX;
        }
      }
      if (this.phase === "toss" && a.id === "nadal") top = 0;
      const dx = gx - a.x;
      const dz = gz - a.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.03 && top > 0) {
        const sp = Math.min(top, d * 7);
        wantX = (dx / d) * sp;
        wantZ = (dz / d) * sp;
      }
    }
    const k = Math.min(1, dt * 11);
    a.vx += (wantX - a.vx) * k;
    a.vz += (wantZ - a.vz) * k;
    a.x += a.vx * dt;
    a.z += a.vz * dt;
    a.x = clamp(a.x, -K.ARENA_X + 0.7, K.ARENA_X - 0.7);
    const zMin = 0.9;
    const zMax = K.ARENA_Z - 0.8;
    if (a.face < 0) a.z = clamp(a.z, zMin, zMax);
    else a.z = clamp(a.z, -zMax, -zMin);

    const plan = a.plan;
    if (plan) {
      if (!plan.swung && now >= plan.tc - PlayerRig.contactTime(plan.side)) {
        plan.swung = true;
        if (Math.hypot(a.x - plan.sx, a.z - plan.sz) < 2.6) a.rig.play(plan.side);
      }
      if (now >= plan.tc) {
        const d = Math.hypot(a.x - plan.sx, a.z - plan.sz);
        a.plan = null;
        if (d <= REACH && this.canHit(a)) {
          // A ball that makes the player run hard is returned with less control.
          const forced = Math.max(0, plan.effort - 0.45) * 1.5;
          this.cpuShot(a, clamp(d / REACH + forced, 0, 1.3));
        }
      }
    }
  }

  private stepBall(h: number) {
    const b = this.ball;
    if (b.state === "held") return;
    const pz = b.p.z;
    const py = b.p.y;
    const px = b.p.x;
    b.v.y -= g * h;
    b.p.addScaledVector(b.v, h);
    if (b.state === "toss") return;

    // Net.
    if (pz !== b.p.z && pz * b.p.z <= 0) {
      const f = pz / (pz - b.p.z);
      const xc = px + (b.p.x - px) * f;
      const yc = py + (b.p.y - py) * f;
      if (Math.abs(xc) < K.NET_POST_X && yc < netHeightAt(xc) + K.BALL_R * 0.6) {
        b.p.set(xc, yc, pz > 0 ? 0.09 : -0.09);
        b.v.z *= -0.12;
        b.v.x *= 0.4;
        b.v.y = Math.min(b.v.y, 0) * 0.4;
        this.listener.onSound("net", 0.6);
        if (b.state === "live") {
          if (b.isServe) this.fault("Net");
          else this.award(other(b.lastHit), "NET");
        }
      }
    }

    // Grass.
    if (b.p.y < K.BALL_R && b.v.y < 0) {
      b.p.y = K.BALL_R;
      const speed = -b.v.y;
      if (b.state === "live") this.onBounce();
      if (speed > 1.2) this.listener.onSound("bounce", clamp(speed / 9, 0.15, 0.7));
      b.v.y = speed * E;
      b.v.x *= F;
      b.v.z *= F;
      if (b.v.y < 0.7) b.v.y = 0;
    }
    if (b.p.y <= K.BALL_R + 0.001 && b.v.y === 0) {
      const drag = Math.max(0, 1 - 1.4 * h);
      b.v.x *= drag;
      b.v.z *= drag;
      // A ball that rolls is dead: it counts as the second bounce.
      if (b.state === "live") this.award(b.lastHit, b.isServe ? "ACE" : "WINNER");
    }

    // Backstop.
    const lx = K.ARENA_X - K.BALL_R;
    const lz = K.ARENA_Z - K.BALL_R;
    let wall = false;
    if (Math.abs(b.p.x) > lx) {
      b.p.x = Math.sign(b.p.x) * lx;
      b.v.x *= -0.3;
      wall = true;
    }
    if (Math.abs(b.p.z) > lz) {
      b.p.z = Math.sign(b.p.z) * lz;
      b.v.z *= -0.3;
      wall = true;
    }
    if (wall && b.state === "live") {
      if (b.bounces === 0) {
        if (b.isServe) this.fault("Long");
        else this.award(other(b.lastHit), "LONG");
      } else {
        this.award(b.lastHit, b.isServe && !b.touched ? "ACE" : "WINNER");
      }
    }
  }

  private onBounce() {
    const b = this.ball;
    b.bounces++;
    this.marker.visible = false;
    if (b.bounces === 1) {
      const res = this.landingOk(b.p.x, b.p.z);
      if (!res.ok) {
        if (b.isServe) {
          this.fault(res.reason === "NET" ? "Net" : res.reason);
        } else {
          const margin = Math.max(
            Math.abs(b.p.x) - K.SINGLES_W,
            Math.abs(b.p.z) - K.HALF_LEN,
          );
          this.award(other(b.lastHit), res.reason, res.reason !== "NET" && margin < 0.3 && b.lastHit === "nadal");
        }
      }
    } else if (b.bounces === 2) {
      this.award(b.lastHit, b.isServe && !b.touched ? "ACE" : "WINNER");
    }
  }
}
