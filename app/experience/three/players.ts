import * as THREE from "three";
import { PLAYER_SCALE } from "./constants";
import { canvasTexture } from "./builder";

/**
 * Stylised low-poly players with a small joint rig. The model faces +z in its
 * own frame. Poses are authored for a right-hander (racket arm on -x) and
 * mirrored for a left-hander.
 */

type Pose = {
  lean: number;
  twist: number;
  rSx: number;
  rSy: number;
  rSz: number;
  rEl: number;
  rWr: number;
  oSx: number;
  oSy: number;
  oSz: number;
  oEl: number;
  rTh: number;
  rKn: number;
  oTh: number;
  oKn: number;
  jump: number;
};

const KEYS = [
  "lean", "twist", "rSx", "rSy", "rSz", "rEl", "rWr", "oSx", "oSy", "oSz",
  "oEl", "rTh", "rKn", "oTh", "oKn", "jump",
] as const;

const READY: Pose = {
  lean: 0.26, twist: 0,
  rSx: -0.55, rSy: 0, rSz: -0.1, rEl: -1.2, rWr: -0.55,
  oSx: -0.6, oSy: 0, oSz: -0.22, oEl: -1.3,
  rTh: -0.42, rKn: 0.8, oTh: -0.42, oKn: 0.8, jump: 0,
};

const P = (p: Partial<Pose>): Pose => ({ ...READY, ...p });

type Track = { keys: [number, Pose][]; contact: number; hold?: boolean };

const TRACKS = {
  fh: {
    contact: 0.3,
    keys: [
      [0, P({ twist: -0.45, rSx: -0.2, rSy: -0.8, rSz: -1.0, rEl: -0.5, rWr: -0.3, oSx: -0.9, oSz: -0.1, oEl: -0.4 })],
      [0.17, P({ twist: -0.95, rSx: -0.1, rSy: -1.55, rSz: -1.1, rEl: -0.7, rWr: -0.5, oSx: -1.1, oSz: -0.3, oEl: -0.3, rTh: -0.3, oTh: -0.6 })],
      [0.3, P({ twist: 0.15, rSx: -0.1, rSy: 0.5, rSz: -1.25, rEl: -0.2, rWr: 0, oSx: -0.5, oSz: 0.3, oEl: -0.9, lean: 0.3 })],
      [0.45, P({ twist: 0.8, rSx: -0.3, rSy: 1.9, rSz: -1.5, rEl: -1.1, rWr: -0.3, oSx: -0.3, oSz: 0.4, oEl: -1.0, lean: 0.2 })],
      [0.64, P({ twist: 0.3, rSx: -0.5, rSy: 0.9, rSz: -0.7, rEl: -1.2, rWr: -0.4 })],
    ],
  },
  bh: {
    contact: 0.3,
    keys: [
      [0, P({ twist: 0.6, rSx: -0.7, rSz: 0.6, rEl: -0.9, oSx: -0.7, oSz: -0.3, oEl: -1.0 })],
      [0.17, P({ twist: 1.3, rSx: -0.8, rSz: 0.9, rEl: -1.0, rWr: -0.4, oSx: -0.8, oSz: -0.5, oEl: -1.1, rTh: -0.6, oTh: -0.3 })],
      [0.3, P({ twist: 0.55, rSx: -1.1, rSz: 0.35, rEl: -0.15, rWr: 0, oSx: -0.95, oSz: -0.3, oEl: -0.5, lean: 0.3 })],
      [0.46, P({ twist: -0.35, rSx: -1.5, rSz: -0.9, rEl: -0.1, rWr: -0.2, oSx: -0.3, oSz: 0.5, oEl: -0.3, lean: 0.18 })],
      [0.64, P({ twist: -0.1, rSx: -0.9, rSz: -0.4, rEl: -0.8 })],
    ],
  },
  toss: {
    contact: 0.3,
    hold: true,
    keys: [
      [0, P({ lean: 0.05, twist: -0.3, rSx: -0.3, rEl: -0.6, rWr: -0.2, oSx: -0.7, oSz: 0, oEl: -0.3, rTh: -0.08, rKn: 0.16, oTh: -0.08, oKn: 0.16 })],
      [0.36, P({ lean: -0.05, twist: -0.7, rSx: 0.3, rSz: -0.9, rEl: -1.2, rWr: -0.2, oSx: -2.9, oSz: 0, oEl: 0, rTh: -0.3, rKn: 0.6, oTh: -0.3, oKn: 0.6 })],
      [0.62, P({ lean: -0.14, twist: -0.9, rSx: -0.2, rSz: -1.6, rEl: -2.0, rWr: -0.2, oSx: -2.7, oSz: 0, oEl: 0, rTh: -0.45, rKn: 0.9, oTh: -0.45, oKn: 0.9 })],
    ],
  },
  serveHit: {
    contact: 0.14,
    keys: [
      [0, P({ lean: -0.14, twist: -0.9, rSx: -0.2, rSz: -1.6, rEl: -2.0, rWr: -0.2, oSx: -2.7, oSz: 0, oEl: 0, rTh: -0.45, rKn: 0.9, oTh: -0.45, oKn: 0.9 })],
      [0.14, P({ lean: 0.25, twist: 0.2, rSx: -2.95, rSz: -0.12, rEl: 0, rWr: 0, oSx: -0.6, oSz: -0.2, oEl: -1.2, rTh: 0, rKn: 0.05, oTh: 0.1, oKn: 0.2, jump: 0.24 })],
      [0.32, P({ lean: 0.55, twist: 0.7, rSx: -0.9, rSz: 0.6, rEl: -0.3, rWr: -0.2, oSx: -0.3, oEl: -1.0, rTh: -0.5, rKn: 0.6, oTh: 0.2, oKn: 0.5, jump: 0.05 })],
      [0.62, P({})],
    ],
  },
} satisfies Record<string, Track>;

export type AnimName = keyof typeof TRACKS;

function sample(track: Track, t: number, out: Pose) {
  const keys = track.keys;
  if (t <= keys[0][0]) return Object.assign(out, keys[0][1]);
  const last = keys[keys.length - 1];
  if (t >= last[0]) return Object.assign(out, last[1]);
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, a] = keys[i];
  const [t1, b] = keys[i + 1];
  let u = (t - t0) / (t1 - t0);
  u = u * u * (3 - 2 * u);
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * u;
  return out;
}

export type PlayerLook = {
  name: "borg" | "mac";
  lefty: boolean;
  skin: number;
  hair: number;
  shorts: number;
  racket: number;
  grip: number;
  shoeAccent: number;
};

const L1 = 0.43;
const L2 = 0.47;

function shirtTexture(name: "borg" | "mac") {
  const tex = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = name === "borg" ? "#f3ecda" : "#f6f5f0";
    ctx.fillRect(0, 0, w, h);
    if (name === "borg") {
      // Fine pinstripes.
      ctx.fillStyle = "#2a3f73";
      for (let x = 0; x < w; x += 8) ctx.fillRect(x, 0, 1.5, h);
      ctx.fillStyle = "#b63a3a";
      for (let x = 4; x < w; x += 16) ctx.fillRect(x, 0, 1, h);
    } else {
      // Navy and red band across the chest.
      ctx.fillStyle = "#1f3566";
      ctx.fillRect(0, 22, w, 20);
      ctx.fillStyle = "#c4262e";
      ctx.fillRect(0, 44, w, 6);
    }
  });
  return tex;
}

function stringsTexture() {
  const tex = canvasTexture(64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(245,240,220,0.85)";
    ctx.lineWidth = 1.2;
    for (let i = 4; i < w; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
  });
  return tex;
}

export class PlayerRig {
  root = new THREE.Group();
  private body = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private shR = new THREE.Group();
  private elR = new THREE.Group();
  private shO = new THREE.Group();
  private elO = new THREE.Group();
  private thR = new THREE.Group();
  private knR = new THREE.Group();
  private thO = new THREE.Group();
  private knO = new THREE.Group();
  private racket = new THREE.Group();
  private offHand = new THREE.Object3D();
  private m: number;
  private phase = 0;
  private time = Math.random() * 10;
  private anim: { name: AnimName; t: number; speed: number } | null = null;
  private pose: Pose = { ...READY };
  private swingPose: Pose = { ...READY };
  private yaw = 0;
  private smoothSpeed = 0;
  private headYaw = 0;
  private textures: THREE.Texture[] = [];

  constructor(public look: PlayerLook) {
    this.m = look.lefty ? -1 : 1;
    this.build();
    this.root.scale.setScalar(PLAYER_SCALE);
  }

  private build() {
    const look = this.look;
    const m = this.m;
    const lambert = (color: number, map?: THREE.Texture) =>
      new THREE.MeshLambertMaterial({ color, map });
    const skin = lambert(look.skin);
    const white = lambert(0xf4f2ea);
    const shirtTex = shirtTexture(look.name);
    this.textures.push(shirtTex);
    const shirt = lambert(0xffffff, shirtTex);
    const sleeve = lambert(look.name === "borg" ? 0xf3ecda : 0xf6f5f0);
    const add = (parent: THREE.Object3D, mesh: THREE.Mesh) => {
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    this.root.add(this.body);
    this.body.add(this.torso);

    // Torso, collar, shorts.
    const chest = add(this.torso, new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.27, 4, 12), shirt));
    chest.position.y = 0.285;
    chest.scale.set(1.16, 1, 0.74);
    const collar = add(
      this.torso,
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.062, 0.085, 0.05, 10),
        lambert(look.name === "borg" ? 0x22346a : 0x1f3566),
      ),
    );
    collar.position.y = 0.555;
    const neck = add(this.torso, new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), skin));
    neck.position.y = 0.6;
    const shorts = add(this.body, new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.25, 12), lambert(look.shorts)));
    shorts.position.y = -0.045;
    shorts.scale.set(1, 1, 0.78);

    // Head.
    this.torso.add(this.head);
    this.head.position.y = 0.63;
    const skull = add(this.head, new THREE.Mesh(new THREE.SphereGeometry(0.112, 14, 12), skin));
    skull.position.y = 0.1;
    skull.scale.set(0.95, 1.08, 1);
    const dark = lambert(0x1c1410);
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 5), dark);
      eye.position.set(s * 0.04, 0.115, 0.102);
      this.head.add(eye);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), skin);
    nose.position.set(0, 0.09, 0.113);
    this.head.add(nose);
    this.buildHair();

    // Arms.
    const arm = (sh: THREE.Group, el: THREE.Group, x: number, hand: THREE.Object3D, band: number | null) => {
      this.torso.add(sh);
      sh.position.set(x, 0.47, 0);
      sh.rotation.order = "YXZ";
      const slv = add(sh, new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.09, 3, 8), sleeve));
      slv.position.y = -0.07;
      const upper = add(sh, new THREE.Mesh(new THREE.CapsuleGeometry(0.043, 0.2, 3, 8), skin));
      upper.position.y = -0.14;
      sh.add(el);
      el.position.y = -0.28;
      const fore = add(el, new THREE.Mesh(new THREE.CapsuleGeometry(0.037, 0.19, 3, 8), skin));
      fore.position.y = -0.13;
      if (band !== null) {
        const wb = add(el, new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.06, 8), lambert(band)));
        wb.position.y = -0.215;
      }
      const palm = add(el, new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), skin));
      palm.position.y = -0.275;
      el.add(hand);
      hand.position.y = -0.275;
    };
    arm(this.shR, this.elR, -0.215 * m, this.racket, look.name === "borg" ? 0xc8343a : 0xf4f2ea);
    arm(this.shO, this.elO, 0.215 * m, this.offHand, look.name === "borg" ? 0xf4f2ea : null);

    // Legs.
    const leg = (th: THREE.Group, kn: THREE.Group, x: number) => {
      this.body.add(th);
      th.position.set(x, -0.02, 0);
      const thigh = add(th, new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.29, 3, 8), skin));
      thigh.position.y = -0.215;
      th.add(kn);
      kn.position.y = -L1;
      const shin = add(kn, new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.27, 3, 8), skin));
      shin.position.y = -0.2;
      const sock = add(kn, new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.13, 8), white));
      sock.position.y = -0.35;
      const shoe = add(kn, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.26), white));
      shoe.position.set(0, -0.43, 0.05);
      const stripe = add(kn, new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.03, 0.12), lambert(look.shoeAccent)));
      stripe.position.set(0, -0.425, 0.05);
    };
    leg(this.thR, this.knR, -0.1 * m);
    leg(this.thO, this.knO, 0.1 * m);

    // Wooden racket: lies in the local x-y plane and extends along -y.
    const frame = lambert(look.racket);
    const handle = add(this.racket, new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.24, 8), lambert(look.grip)));
    handle.position.y = -0.07;
    const throat = add(this.racket, new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 6), frame));
    throat.position.y = -0.27;
    const hoop = add(this.racket, new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.013, 6, 22), frame));
    hoop.position.y = -0.5;
    hoop.scale.set(0.88, 1.18, 1);
    const stringsTex = stringsTexture();
    this.textures.push(stringsTex);
    const strings = new THREE.Mesh(
      new THREE.CircleGeometry(0.122, 20),
      new THREE.MeshBasicMaterial({ map: stringsTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    );
    strings.position.y = -0.5;
    strings.scale.set(0.88, 1.18, 1);
    this.racket.add(strings);
  }

  private buildHair() {
    const look = this.look;
    const hair = new THREE.MeshLambertMaterial({ color: look.hair, flatShading: true });
    const add = (mesh: THREE.Mesh) => {
      mesh.castShadow = true;
      this.head.add(mesh);
      return mesh;
    };
    const band = (y: number, color: number, tube: number) => {
      const t = add(new THREE.Mesh(new THREE.TorusGeometry(0.111, tube, 6, 20), new THREE.MeshLambertMaterial({ color })));
      t.rotation.x = Math.PI / 2 - 0.12;
      t.position.set(0, y, 0);
      return t;
    };
    if (look.name === "borg") {
      // Long, straight, shoulder-length blond hair under a striped headband.
      const cap = add(new THREE.Mesh(new THREE.SphereGeometry(0.122, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hair));
      cap.position.y = 0.105;
      cap.scale.set(0.98, 1.1, 1.03);
      const fall = add(
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.124, 0.15, 0.27, 14, 1, true, Math.PI * 0.62, Math.PI * 1.76),
          new THREE.MeshLambertMaterial({ color: look.hair, side: THREE.DoubleSide, flatShading: true }),
        ),
      );
      fall.position.set(0, 0.0, -0.005);
      fall.rotation.y = Math.PI;
      band(0.155, 0xf4f2ea, 0.02);
      band(0.163, 0xc8343a, 0.008);
      band(0.147, 0x22346a, 0.008);
      // Light beard.
      const beard = add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.116, 12, 6, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.62, Math.PI * 0.3),
          new THREE.MeshLambertMaterial({ color: 0xb98e58 }),
        ),
      );
      beard.position.y = 0.1;
      beard.scale.set(0.97, 1.08, 1.02);
    } else {
      // A dense mop of dark curls above a red headband.
      const curl = new THREE.IcosahedronGeometry(1, 1);
      const spots: [number, number, number, number][] = [
        [0, 0.215, 0.0, 0.085], [0.07, 0.2, 0.03, 0.07], [-0.07, 0.2, 0.03, 0.07],
        [0.06, 0.2, -0.06, 0.075], [-0.06, 0.2, -0.06, 0.075], [0, 0.19, -0.1, 0.075],
        [0.115, 0.15, -0.02, 0.062], [-0.115, 0.15, -0.02, 0.062],
        [0.1, 0.12, -0.08, 0.065], [-0.1, 0.12, -0.08, 0.065],
        [0, 0.12, -0.125, 0.075], [0.06, 0.06, -0.11, 0.06], [-0.06, 0.06, -0.11, 0.06],
        [0.125, 0.09, -0.02, 0.05], [-0.125, 0.09, -0.02, 0.05],
        [0.045, 0.205, 0.075, 0.05], [-0.045, 0.205, 0.075, 0.05], [0, 0.21, 0.085, 0.045],
      ];
      for (const [x, y, z, r] of spots) {
        const c = add(new THREE.Mesh(curl, hair));
        c.position.set(x, y, z);
        c.scale.setScalar(r);
      }
      band(0.158, 0xc4262e, 0.019);
    }
  }

  play(name: AnimName, speed = 1) {
    this.anim = { name, t: 0, speed };
  }

  stop() {
    this.anim = null;
  }

  get playing(): AnimName | null {
    return this.anim?.name ?? null;
  }

  /** Seconds from `play` to the moment the strings meet the ball. */
  static contactTime(name: AnimName, speed = 1) {
    return TRACKS[name].contact / speed;
  }

  offHandPosition(out: THREE.Vector3) {
    return this.offHand.getWorldPosition(out);
  }

  /**
   * @param vx world velocity x
   * @param vz world velocity z
   * @param face +1 when the player looks toward +z, -1 toward -z
   * @param look a world point the head follows (the ball)
   */
  update(dt: number, x: number, z: number, vx: number, vz: number, face: number, look?: THREE.Vector3) {
    this.time += dt;
    const speed = Math.hypot(vx, vz);
    this.smoothSpeed += (speed - this.smoothSpeed) * Math.min(1, dt * 10);
    const s = Math.min(1, this.smoothSpeed / 5.5);
    this.phase += dt * (5 + this.smoothSpeed * 1.6);
    const ph = this.phase;
    const p = this.pose;

    // Locomotion: blend the ready stance with a run cycle.
    const run: Pose = {
      lean: 0.34, twist: 0.1 * Math.sin(ph),
      rSx: -0.45 - 0.3 * Math.sin(ph), rSy: 0, rSz: -0.12, rEl: -1.3, rWr: -0.5,
      oSx: -0.2 + 0.65 * Math.sin(ph), oSy: 0, oSz: 0.12, oEl: -1.25,
      rTh: -0.3 - 0.8 * Math.sin(ph), rKn: Math.max(0.12, 0.6 + 0.75 * Math.sin(ph + 1.3)),
      oTh: -0.3 + 0.8 * Math.sin(ph), oKn: Math.max(0.12, 0.6 - 0.75 * Math.sin(ph + 1.3)),
      jump: 0.04 * Math.abs(Math.sin(ph)),
    };
    for (const k of KEYS) p[k] = READY[k] + (run[k] - READY[k]) * s;
    p.jump += (1 - s) * 0.025 * Math.abs(Math.sin(this.time * 4.2));

    // Overlay the stroke.
    if (this.anim) {
      const track: Track = TRACKS[this.anim.name];
      this.anim.t += dt * this.anim.speed;
      const t = this.anim.t;
      const end = track.keys[track.keys.length - 1][0];
      sample(track, t, this.swingPose);
      let w = Math.min(1, t / 0.07);
      if (!track.hold) w = Math.min(w, Math.max(0, (end + 0.16 - t) / 0.16));
      // Keep the legs running under a ground stroke.
      const legW = this.anim.name === "fh" || this.anim.name === "bh" ? w * (1 - s) : w;
      for (const k of KEYS) {
        const kw = k === "rTh" || k === "rKn" || k === "oTh" || k === "oKn" ? legW : w;
        p[k] += (this.swingPose[k] - p[k]) * kw;
      }
      if (!track.hold && t > end + 0.16) this.anim = null;
    }

    // Apply to the joints.
    const m = this.m;
    this.torso.rotation.set(p.lean, m * p.twist, 0);
    this.shR.rotation.set(p.rSx, m * p.rSy, m * p.rSz);
    this.elR.rotation.x = p.rEl;
    this.racket.rotation.x = p.rWr;
    this.shO.rotation.set(p.oSx, -m * p.oSy, -m * p.oSz);
    this.elO.rotation.x = p.oEl;
    this.thR.rotation.set(p.rTh, 0, -m * 0.07);
    this.knR.rotation.x = p.rKn;
    this.thO.rotation.set(p.oTh, 0, m * 0.07);
    this.knO.rotation.x = p.oKn;
    const reach = Math.max(
      L1 * Math.cos(p.rTh) + L2 * Math.cos(p.rTh + p.rKn),
      L1 * Math.cos(p.oTh) + L2 * Math.cos(p.oTh + p.oKn),
    );
    this.body.position.y = reach + 0.02 + p.jump;

    // Face the net, turning a little into the run.
    const baseYaw = face > 0 ? 0 : Math.PI;
    let turn = 0;
    if (this.smoothSpeed > 0.6) {
      const local = Math.atan2(vx * face, vz * face);
      turn = Math.max(-0.9, Math.min(0.9, local)) * s;
      if (Math.abs(local) > Math.PI / 2) turn = Math.sign(local) * 0.5 * s;
    }
    const target = baseYaw + turn;
    let dy = target - this.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.yaw += dy * Math.min(1, dt * 9);
    this.root.rotation.y = this.yaw;
    this.root.position.set(x, 0, z);

    if (look) {
      const a = Math.atan2(look.x - x, look.z - z) - this.yaw - m * p.twist;
      const wrapped = Math.atan2(Math.sin(a), Math.cos(a));
      const clamped = Math.max(-1.1, Math.min(1.1, wrapped));
      this.headYaw += (clamped - this.headYaw) * Math.min(1, dt * 8);
      this.head.rotation.y = this.headYaw;
    }
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  }
}

export function createPlayers() {
  const borg = new PlayerRig({
    name: "borg",
    lefty: false,
    skin: 0xd6a273,
    hair: 0xd9b565,
    shorts: 0xf4f1e6,
    racket: 0x1b1b1d,
    grip: 0x6b3a22,
    shoeAccent: 0xc9a23f,
  });
  const mac = new PlayerRig({
    name: "mac",
    lefty: true,
    skin: 0xe7ba98,
    hair: 0x3a2415,
    shorts: 0xf6f5f0,
    racket: 0xb07a43,
    grip: 0x2b2118,
    shoeAccent: 0x1f3566,
  });
  return { borg, mac };
}
