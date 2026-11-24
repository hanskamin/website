import * as THREE from "three";
import * as K from "./constants";
import type { ViewId } from "./constants";
import { buildStadium } from "./stadium";
import { buildAreas, type MonitorInfo, type MusicState } from "./areas";
import { createPlayers } from "./players";
import { Game, type Call, type GameSnapshot } from "./game";
import { Sfx } from "./audio";

type PoseDef = { pos: [number, number, number]; target: [number, number, number]; fov: number };

// Camera positions, authored for a 16:10 screen and for a tall phone.
const POSES: Record<ViewId, { land: PoseDef; port: PoseDef }> = {
  home: {
    land: { pos: [0, 14, 32.6], target: [0, 0, -6.9], fov: 40 },
    port: { pos: [0, 14, 32.6], target: [0, 0, 1.5], fov: 60 },
  },
  music: {
    land: { pos: [0, 7.6, 4.5], target: [0, 6.4, -27], fov: 34 },
    port: { pos: [0, 7.6, 0.5], target: [0, 6.3, -27], fov: 60 },
  },
  software: {
    land: { pos: [-8.2, 5.7, 0], target: [-18, 5.45, 0], fov: 36 },
    port: { pos: [-6.2, 5.8, 0], target: [-18, 5.45, 0], fov: 60 },
  },
  volunteering: {
    land: { pos: [0, 5.3, 13.6], target: [0, 4.85, 27.3], fov: 33 },
    port: { pos: [0, 5.4, 11.6], target: [0, 4.85, 27.3], fov: 60 },
  },
  play: {
    land: { pos: [0, 6.8, 24], target: [0, 0, 1], fov: 40 },
    port: { pos: [0, 17, 23.5], target: [0, 0, 2.5], fov: 62 },
  },
};

type CamState = {
  pos: THREE.Vector3;
  yaw: number;
  pitch: number;
  tan: number;
  ox: number;
  oy: number;
};

const newState = (): CamState => ({
  pos: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  tan: 0.3,
  ox: 0,
  oy: 0,
});

const lerpAngle = (a: number, b: number, t: number) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * t;
};

export type WorldOptions = {
  monitors: MonitorInfo[];
  stack: string[];
  photos: string[];
  reducedMotion: boolean;
  onPick: (kind: "monitor" | "photo", index: number) => void;
  onGameState: (s: GameSnapshot) => void;
  onCall: (c: Call | null) => void;
  onReady: () => void;
};

export type WorldHandle = {
  setView: (v: ViewId, instant?: boolean) => void;
  setInsets: (right: number, bottom: number) => void;
  setMusic: (s: MusicState) => void;
  setMonitor: (i: number) => void;
  setPhoto: (i: number) => void;
  game: Game;
  sfx: Sfx;
  dispose: () => void;
};

export function createWorld(canvas: HTMLCanvasElement, opts: WorldOptions): WorldHandle {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowPower = coarse || window.innerWidth < 820;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1.6, 0.3, 900);

  // Light: a high afternoon sun from the south-west.
  scene.add(new THREE.HemisphereLight(0xdcebff, 0x55703c, 1.15));
  const sun = new THREE.DirectionalLight(0xfff0d2, 2.9);
  sun.position.set(-36, 54, 25);
  sun.castShadow = true;
  const sc = sun.shadow.camera;
  sc.left = -46;
  sc.right = 46;
  sc.top = 46;
  sc.bottom = -46;
  sc.near = 5;
  sc.far = 150;
  sc.updateProjectionMatrix();
  sun.shadow.mapSize.setScalar(lowPower ? 2048 : 4096);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  scene.add(sun, sun.target);

  const stadium = buildStadium({ lowPower });
  scene.add(stadium.group);
  const areas = buildAreas(opts);
  scene.add(areas.group);

  const rigs = createPlayers();
  scene.add(rigs.mac.root, rigs.borg.root);

  // Ball, its ground shadow, and the landing marker.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(K.BALL_R, 14, 10),
    new THREE.MeshLambertMaterial({ color: 0xfbfaf2, emissive: 0x55554a }),
  );
  scene.add(ball);
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 16),
    new THREE.MeshBasicMaterial({ color: 0x0c1a08, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.renderOrder = 3;
  scene.add(blob);
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.34, 0.5, 28),
    new THREE.MeshBasicMaterial({ color: 0xf4cf2a, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.03;
  marker.renderOrder = 3;
  marker.visible = false;
  scene.add(marker);

  const sfx = new Sfx();
  let cheer = 0;
  const game = new Game(rigs, {
    onState: (s) => {
      stadium.setScore({ borg: s.labels.borg, mac: s.labels.mac, serving: "mac" });
      opts.onGameState(s);
    },
    onCall: (c) => opts.onCall(c),
    onSound: (name, volume) => {
      if (game?.mode === "match") sfx.play(name, volume);
    },
    onCheer: (amount) => {
      cheer = Math.max(cheer, amount);
    },
  });

  // ── Camera rig ─────────────────────────────────────────────────────────
  let view: ViewId = "home";
  let width = 1;
  let height = 1;
  const insets = { right: 0, bottom: 0 };
  const from = newState();
  const goal = newState();
  const cur = newState();
  let flight = 1;
  let flightDur = 1.8;
  let flightLift = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vT = new THREE.Vector3();
  let elapsed = 0;

  const computeGoal = (out: CamState) => {
    const aspect = width / height;
    const def = POSES[view];
    const k = THREE.MathUtils.smoothstep(aspect, 0.7, 1.15);
    const landTan =
      Math.tan(THREE.MathUtils.degToRad(def.land.fov) / 2) *
      THREE.MathUtils.clamp(1.6 / aspect, 1, 1.4);
    const portTan =
      Math.tan(THREE.MathUtils.degToRad(def.port.fov) / 2) *
      THREE.MathUtils.clamp(0.46 / aspect, 0.82, 1.12);
    vA.fromArray(def.port.pos).lerp(vB.fromArray(def.land.pos), k);
    out.pos.copy(vA);
    vT.fromArray(def.port.target).lerp(vB.fromArray(def.land.target), k);
    out.tan = portTan + (landTan - portTan) * k;

    if (view === "play") {
      const follow = k > 0.5 ? 0.32 : 0.22;
      out.pos.x += game.mac.x * follow;
      vT.x += game.mac.x * follow * 0.8 + game.ball.p.x * 0.04;
    }
    if (!opts.reducedMotion) {
      const sway = view === "play" ? 0.03 : 0.12;
      out.pos.x += Math.sin(elapsed * 0.21) * sway;
      out.pos.y += Math.sin(elapsed * 0.17 + 1.3) * sway * 0.5;
    }
    vB.copy(vT).sub(out.pos);
    out.yaw = Math.atan2(vB.x, vB.z);
    out.pitch = Math.atan2(vB.y, Math.hypot(vB.x, vB.z));
    if (view !== "play" && !coarse) {
      out.yaw -= pointer.sx * 0.022;
      out.pitch += pointer.sy * 0.012;
    }
    out.ox = insets.right / 2;
    out.oy = insets.bottom / 2;
  };

  const applyCamera = (s: CamState) => {
    camera.position.copy(s.pos);
    const cp = Math.cos(s.pitch);
    vB.set(Math.sin(s.yaw) * cp, Math.sin(s.pitch), Math.cos(s.yaw) * cp).add(s.pos);
    camera.lookAt(vB);
    camera.fov = THREE.MathUtils.radToDeg(Math.atan(s.tan) * 2);
    camera.aspect = width / height;
    if (Math.abs(s.ox) > 0.0005 || Math.abs(s.oy) > 0.0005) {
      camera.setViewOffset(width, height, s.ox * width, s.oy * height, width, height);
    } else if (camera.view) {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  };

  const copyState = (a: CamState, b: CamState) => {
    a.pos.copy(b.pos);
    a.yaw = b.yaw;
    a.pitch = b.pitch;
    a.tan = b.tan;
    a.ox = b.ox;
    a.oy = b.oy;
  };

  const updateCamera = (dt: number) => {
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3);
    computeGoal(goal);
    if (flight < 1) {
      flight = Math.min(1, flight + dt / flightDur);
      const e = flight < 0.5 ? 4 * flight ** 3 : 1 - (-2 * flight + 2) ** 3 / 2;
      cur.pos.copy(from.pos).lerp(goal.pos, e);
      cur.pos.y += Math.sin(Math.PI * e) * flightLift;
      cur.yaw = lerpAngle(from.yaw, goal.yaw, e);
      cur.pitch = from.pitch + (goal.pitch - from.pitch) * e;
      cur.tan = from.tan + (goal.tan - from.tan) * e;
      cur.ox = from.ox + (goal.ox - from.ox) * e;
      cur.oy = from.oy + (goal.oy - from.oy) * e;
    } else {
      // Settled: ease the screen offset, track everything else directly.
      const ox = cur.ox + (goal.ox - cur.ox) * Math.min(1, dt * 5);
      const oy = cur.oy + (goal.oy - cur.oy) * Math.min(1, dt * 5);
      copyState(cur, goal);
      cur.ox = ox;
      cur.oy = oy;
    }
    applyCamera(cur);
  };

  const setView = (v: ViewId, instant = false) => {
    if (v === view && !instant) return;
    view = v;
    if (instant || opts.reducedMotion) {
      computeGoal(goal);
      copyState(cur, goal);
      flight = 1;
      return;
    }
    copyState(from, cur);
    computeGoal(goal);
    const dist = from.pos.distanceTo(goal.pos);
    flightDur = THREE.MathUtils.clamp(1.3 + dist / 38, 1.4, 2.4);
    flightLift = Math.min(1.6, dist * 0.05);
    flight = 0;
  };

  // ── Picking ────────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickAt = (clientX: number, clientY: number) => {
    const kind = view === "software" ? "monitor" : view === "volunteering" ? "photo" : null;
    if (!kind) return null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(
      areas.pickables.filter((o) => o.userData.kind === kind),
      false,
    );
    if (!hits.length) return null;
    return hits[0].object.userData as { kind: "monitor" | "photo"; index: number };
  };
  let downAt: { x: number; y: number } | null = null;
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    if (e.pointerType !== "mouse") return;
    const hit = e.target === canvas ? pickAt(e.clientX, e.clientY) : null;
    areas.setHover(hit?.kind ?? null, hit?.index ?? -1);
    canvas.style.cursor = hit ? "pointer" : "";
  };
  const onPointerDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 8) return;
    const hit = pickAt(e.clientX, e.clientY);
    if (hit) opts.onPick(hit.kind, hit.index);
  };
  window.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);

  // ── Resize ─────────────────────────────────────────────────────────────
  const resize = () => {
    const parent = canvas.parentElement ?? canvas;
    width = Math.max(1, parent.clientWidth);
    height = Math.max(1, parent.clientHeight);
    renderer.setSize(width, height, false);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement ?? canvas);

  computeGoal(goal);
  copyState(cur, goal);

  // ── Loop ───────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let ready = false;
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.1);
    elapsed += dt;
    game.update(dt);
    areas.update(dt, elapsed);

    const b = game.ball;
    ball.position.copy(b.p);
    blob.position.set(b.p.x, 0.02, b.p.z);
    const hgt = Math.max(0, b.p.y - K.BALL_R);
    blob.scale.setScalar(1 + hgt * 0.18);
    (blob.material as THREE.MeshBasicMaterial).opacity = 0.5 / (1 + hgt * 0.5);
    marker.visible = game.marker.visible && view === "play";
    if (marker.visible) {
      marker.position.x = game.marker.x;
      marker.position.z = game.marker.z;
      marker.scale.setScalar(1 + 0.12 * Math.sin(elapsed * 9));
    }

    cheer = Math.max(0, cheer - dt * 0.38);
    stadium.crowd.uTime.value = opts.reducedMotion ? 0 : elapsed;
    stadium.crowd.uCheer.value = opts.reducedMotion ? 0 : Math.min(1, cheer * 1.6);

    updateCamera(dt);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };
  renderer.setAnimationLoop(frame);
  const onVisibility = () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      clock.getDelta();
      renderer.setAnimationLoop(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setView,
    setInsets: (right, bottom) => {
      insets.right = right;
      insets.bottom = bottom;
    },
    setMusic: areas.setMusic,
    setMonitor: areas.setMonitor,
    setPhoto: areas.setPhoto,
    game,
    sfx,
    dispose: () => {
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      ro.disconnect();
      sfx.dispose();
      stadium.dispose();
      areas.dispose();
      rigs.mac.dispose();
      rigs.borg.dispose();
      ball.geometry.dispose();
      blob.geometry.dispose();
      marker.geometry.dispose();
      renderer.dispose();
    },
  };
}
