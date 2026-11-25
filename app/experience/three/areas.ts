import * as THREE from "three";
import * as K from "./constants";
import { Builder, canvasTexture, signTexture } from "./builder";

/**
 * The three pavilions cut into the stands. Each one is built in a local frame:
 * +z points away from the court, y is up, and a viewer on the court sees +x on
 * the left.
 */

export type MusicState = {
  playing: boolean;
  index: number;
  title: string;
  year: number;
  videoId: string;
  total: number;
};

export type MonitorInfo = { year: string; role: string; co: string };

export type Areas = {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  update: (dt: number, t: number) => void;
  setMusic: (s: MusicState) => void;
  setMonitor: (i: number) => void;
  setPhoto: (i: number) => void;
  dispose: () => void;
};

const G = K.GAP;

function shellBlock(
  o: { yF: number; dB: number; yTop: number; floor: number; back: number },
  sign: string,
  disposables: { dispose: () => void }[],
) {
  const group = new THREE.Group();
  const b = new Builder();
  b.box(2 * G, o.yF, o.dB, K.COLORS.wall, 0, o.yF / 2, o.dB / 2);
  b.box(2 * G - 0.02, 0.06, o.dB, o.floor, 0, o.yF + 0.03, o.dB / 2);
  b.box(2 * G, o.yTop, K.SHELL_D - o.dB, o.back, 0, o.yTop / 2, o.dB + (K.SHELL_D - o.dB) / 2);
  group.add(b.build());
  const tex = signTexture(sign);
  disposables.push(tex);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 1.15),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  plate.position.set(0, Math.max(0.75, o.yF - 0.85), -0.03);
  plate.rotation.y = Math.PI;
  group.add(plate);
  return group;
}

// ── Music: the bandstand at the north end ────────────────────────────────

function buildMusic(disposables: { dispose: () => void }[]) {
  const yF = 3.0;
  const dB = 8.6;
  const group = shellBlock(
    { yF, dB, yTop: 11.6, floor: 0x3a2a1f, back: 0x101012 },
    "MUSIC",
    disposables,
  );
  group.position.set(0, 0, -K.ARENA_Z);
  group.rotation.y = Math.PI;

  const b = new Builder();
  const black = 0x141416;
  // Wings and screen surround.
  for (const s of [-1, 1]) {
    b.box(0.5, 8.4, dB - 0.4, 0x17171a, s * (G - 0.25), yF + 4.2, dB / 2 + 0.2);
    // Truss towers.
    b.box(0.3, 8.0, 0.3, 0x8d9096, s * 5.5, yF + 4.0, 1.0);
    // Speaker stacks.
    b.box(1.2, 1.5, 1.0, black, s * 4.6, yF + 0.75, 1.5);
    b.box(1.2, 1.5, 1.0, black, s * 4.6, yF + 2.25, 1.5);
    b.box(1.0, 0.8, 0.8, black, s * 4.6, yF + 3.4, 1.5);
    // Floor monitors.
    b.box(0.9, 0.35, 0.6, black, s * 1.6, yF + 0.2, 0.9, [-0.35, 0, 0]);
  }
  b.box(11.3, 0.3, 0.3, 0x8d9096, 0, yF + 7.85, 1.0);
  b.box(10.2, 5.9, 0.2, 0x0a0a0c, 0, yF + 3.75, dB - 0.15);
  // Drum riser and kit.
  b.box(3.0, 0.3, 2.2, 0x222226, 0, yF + 0.15, 6.0);
  b.cyl(0.36, 0.36, 0.45, 0xb0282e, 0, yF + 0.66, 5.4, [Math.PI / 2, 0, 0], 18);
  b.cyl(0.36, 0.36, 0.02, 0xf2efe6, 0, yF + 0.66, 5.16, [Math.PI / 2, 0, 0], 18);
  b.cyl(0.2, 0.2, 0.16, 0xb0282e, -0.6, yF + 1.0, 5.6, undefined, 14);
  b.cyl(0.17, 0.17, 0.2, 0xb0282e, -0.22, yF + 1.22, 5.5, [0.3, 0, 0], 14);
  b.cyl(0.19, 0.19, 0.22, 0xb0282e, 0.25, yF + 1.22, 5.5, [0.3, 0, 0], 14);
  b.cyl(0.25, 0.25, 0.4, 0xb0282e, 0.75, yF + 0.75, 5.9, undefined, 14);
  for (const [x, y, r] of [[-1.05, 1.55, 0.28], [1.05, 1.65, 0.32], [-0.75, 1.2, 0.2]]) {
    b.cyl(0.015, 0.015, y, 0x9a9da3, x, yF + 0.3 + y / 2, 5.9);
    b.cyl(r, r, 0.015, 0xd8b25a, x, yF + 0.32 + y, 5.9, [0.15, 0, 0.1], 16);
  }
  b.box(0.4, 0.5, 0.4, 0x222226, 0, yF + 0.55, 6.5);
  // Keyboard on an X stand.
  b.box(0.05, 1.15, 0.05, 0x55585e, 2.9, yF + 0.5, 3.6, [0, 0, 0.6]);
  b.box(0.05, 1.15, 0.05, 0x55585e, 2.9, yF + 0.5, 3.6, [0, 0, -0.6]);
  b.box(1.45, 0.1, 0.42, 0x1b1b1f, 2.9, yF + 1.0, 3.6);
  b.box(1.35, 0.02, 0.2, 0xf2efe6, 2.9, yF + 1.06, 3.52);
  // Guitar on a stand, with its amp.
  b.box(0.36, 0.48, 0.08, 0xc7722c, -2.9, yF + 0.5, 3.9, [0.2, 0, 0]);
  b.box(0.07, 0.75, 0.04, 0x3a2516, -2.9, yF + 1.08, 4.02, [0.2, 0, 0]);
  b.box(0.8, 0.7, 0.4, 0x1b1b1f, -3.2, yF + 0.38, 5.0);
  b.box(0.7, 0.45, 0.02, 0x6b5b3e, -3.2, yF + 0.36, 4.79);
  // Microphone.
  b.cyl(0.018, 0.018, 1.5, 0x9a9da3, 0, yF + 0.78, 2.3);
  b.cyl(0.22, 0.22, 0.03, 0x33363b, 0, yF + 0.08, 2.3, undefined, 14);
  b.sphere(0.06, 0x2b2b2f, 0, yF + 1.56, 2.26);
  group.add(b.build());

  const stageLamp = new THREE.PointLight(0xffe0b0, 55, 24, 1.5);
  stageLamp.position.set(0, yF + 6.2, 2.4);
  group.add(stageLamp);

  // The screen behind the stage shows the current release.
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext("2d")!;
  const screenTex = new THREE.CanvasTexture(canvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = 8;
  disposables.push(screenTex);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 5.4),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
  );
  screen.position.set(0, yF + 3.75, dB - 0.27);
  screen.rotation.y = Math.PI;
  group.add(screen);

  let state: MusicState | null = null;
  let art: HTMLImageElement | null = null;
  let artFor = "";
  const drawScreen = () => {
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#2a1740");
    grad.addColorStop(1, "#0c2f22");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    if (art && state && artFor === state.videoId) {
      const s = Math.max(w / art.width, h / art.height);
      const dw = art.width * s;
      const dh = art.height * s;
      ctx.drawImage(art, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    const shade = ctx.createLinearGradient(0, h * 0.45, 0, h);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.82)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#f4cf2a";
    ctx.font = "700 26px ui-monospace, Menlo, monospace";
    const label = !state
      ? "HANS · LIVE AT CENTRE COURT"
      : state.playing
        ? `NOW PLAYING · ${String(state.index + 1).padStart(2, "0")} / ${state.total}`
        : `${String(state.index + 1).padStart(2, "0")} / ${state.total}`;
    ctx.fillText(label, 44, h - 118);
    ctx.fillStyle = "#fbf6e6";
    let size = 76;
    const title = state ? state.title : "the bandstand";
    do {
      ctx.font = `700 ${size}px Georgia, "Times New Roman", serif`;
      size -= 4;
    } while (ctx.measureText(title).width > w - 88 && size > 28);
    ctx.fillText(title, 44, h - 46);
    if (state) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#f4cf2a";
      ctx.font = "700 30px ui-monospace, Menlo, monospace";
      ctx.fillText(`HANS · ${state.year}`, w - 44, 60);
    }
    screenTex.needsUpdate = true;
  };
  drawScreen();

  // Stage lights and beams.
  const lamps: THREE.Mesh[] = [];
  const beams: THREE.Mesh[] = [];
  const beamGeo = new THREE.ConeGeometry(1.5, 7.4, 16, 1, true);
  beamGeo.translate(0, -3.7, 0);
  const lampGeo = new THREE.SphereGeometry(0.16, 10, 8);
  for (let i = 0; i < 8; i++) {
    const x = -4.55 + i * 1.3;
    const lamp = new THREE.Mesh(
      lampGeo,
      new THREE.MeshBasicMaterial({ color: 0x33343a }),
    );
    lamp.position.set(x, yF + 7.62, 1.0);
    group.add(lamp);
    lamps.push(lamp);
    const beam = new THREE.Mesh(
      beamGeo,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    beam.position.copy(lamp.position);
    beam.rotation.x = -0.32;
    beam.visible = false;
    group.add(beam);
    beams.push(beam);
  }

  // Speaker cones.
  const cones: THREE.Mesh[] = [];
  const coneGeo = new THREE.CircleGeometry(0.42, 20);
  const coneMat = new THREE.MeshLambertMaterial({ color: 0x3a3b40 });
  for (const s of [-1, 1]) {
    for (const y of [0.75, 2.25]) {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(s * 4.6, yF + y, 0.99);
      cone.rotation.y = Math.PI;
      group.add(cone);
      cones.push(cone);
    }
  }

  // Level meter along the stage lip.
  const BARS = 28;
  const eq = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.22, 1, 0.12),
    new THREE.MeshBasicMaterial({ toneMapped: false }),
    BARS,
  );
  const eqColor = new THREE.Color();
  for (let i = 0; i < BARS; i++) {
    eqColor.setHSL(0.76 - (i / BARS) * 0.42, 0.75, 0.6);
    eq.setColorAt(i, eqColor);
  }
  group.add(eq);
  const eqM = new THREE.Matrix4();
  const eqLevels = new Float32Array(BARS).fill(0.08);
  const lampColor = new THREE.Color();
  let energy = 0;

  const update = (dt: number, t: number) => {
    const playing = !!state?.playing;
    energy += ((playing ? 1 : 0) - energy) * Math.min(1, dt * 3);
    const beat = Math.pow(Math.max(0, Math.sin(t * 6.6)), 6);
    for (let i = 0; i < BARS; i++) {
      const target = playing
        ? 0.15 +
          0.85 *
            Math.abs(
              Math.sin(t * (2.1 + (i % 5) * 0.9) + i * 1.7) *
                Math.sin(t * 1.3 + i * 0.37),
            )
        : 0.06;
      eqLevels[i] += (target - eqLevels[i]) * Math.min(1, dt * 14);
      const hgt = eqLevels[i] * 1.5;
      eqM.makeScale(1, hgt, 1);
      eqM.setPosition(-4.05 + i * 0.3, yF + 0.06 + hgt / 2, 0.14);
      eq.setMatrixAt(i, eqM);
    }
    eq.instanceMatrix.needsUpdate = true;
    lamps.forEach((lamp, i) => {
      lampColor.setHSL((t * 0.07 + i * 0.11) % 1, 0.8, 0.6);
      const mat = lamp.material as THREE.MeshBasicMaterial;
      mat.color.setRGB(
        0.2 + (lampColor.r - 0.2) * energy,
        0.2 + (lampColor.g - 0.2) * energy,
        0.22 + (lampColor.b - 0.22) * energy,
      );
      const beam = beams[i];
      beam.visible = energy > 0.02;
      const bm = beam.material as THREE.MeshBasicMaterial;
      bm.color.copy(lampColor);
      bm.opacity = energy * (0.07 + 0.06 * beat);
      beam.rotation.z = Math.sin(t * 0.8 + i * 0.9) * 0.22 * energy;
    });
    const pulse = 1 + beat * 0.1 * energy;
    cones.forEach((c) => c.scale.setScalar(pulse));
  };

  const setMusic = (s: MusicState) => {
    const changed = !state || state.videoId !== s.videoId;
    state = s;
    if (changed) {
      const id = s.videoId;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (state?.videoId !== id) return;
        art = img;
        artFor = id;
        try {
          drawScreen();
        } catch {
          art = null;
          drawScreen();
        }
      };
      img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
    drawScreen();
  };

  return { group, update, setMusic };
}

// ── Software: the press box on the west side ─────────────────────────────

function buildSoftware(
  monitors: MonitorInfo[],
  stack: string[],
  disposables: { dispose: () => void }[],
  pickables: THREE.Object3D[],
) {
  const yF = 3.6;
  const dB = 7.5;
  const H = 3.8;
  const group = shellBlock(
    { yF, dB, yTop: yF + H + 0.3, floor: 0x4a4f4a, back: 0x26332c },
    "SOFTWARE",
    disposables,
  );
  group.position.set(-K.ARENA_X, 0, 0);
  group.rotation.y = -Math.PI / 2;

  const b = new Builder();
  // Roof slab, side walls, window mullions.
  b.box(2 * G, 0.3, dB + 0.4, K.COLORS.wall, 0, yF + H + 0.15, dB / 2 - 0.2);
  b.box(2 * G, 0.5, 0.25, K.COLORS.wall, 0, yF + H - 0.25, -0.05);
  for (const s of [-1, 1]) {
    b.box(0.2, H, dB, 0x1d2a24, s * (G - 0.1), yF + H / 2, dB / 2);
  }
  for (const x of [-5.2, -2.6, 2.6, 5.2]) {
    b.box(0.08, H - 0.5, 0.08, 0x0e2019, x, yF + (H - 0.5) / 2, 0.05);
  }
  b.box(2 * G, 0.5, 0.2, K.COLORS.wall, 0, yF + 0.25, 0.05);
  // Desk, keyboards, chairs.
  b.box(8.4, 0.08, 1.1, 0x6b4a2e, 0, yF + 0.75, 4.4);
  for (const x of [-4.0, 0, 4.0]) b.box(0.1, 0.75, 1.0, 0x3b2a1c, x, yF + 0.375, 4.4);
  for (const x of [-2.6, -0.9, 0.9, 2.6]) {
    b.box(0.62, 0.05, 0.24, 0xd9d2bd, x, yF + 0.82, 4.2, [0.12, 0, 0]);
    b.cyl(0.05, 0.045, 0.1, 0xf2efe6, x + 0.5, yF + 0.84, 4.5);
  }
  for (const x of [-1.8, 1.8]) {
    b.cyl(0.26, 0.26, 0.08, 0x4b2a6b, x, yF + 0.5, 3.2, undefined, 14);
    b.cyl(0.04, 0.04, 0.5, 0x55585e, x, yF + 0.25, 3.2);
    b.box(0.5, 0.42, 0.06, 0x4b2a6b, x, yF + 0.78, 2.95);
  }
  // Monitor casings: three over two.
  const slots: [number, number][] = [
    [1.75, 2.6],
    [0, 2.6],
    [-1.75, 2.6],
    [0.875, 1.32],
    [-0.875, 1.32],
  ];
  slots.forEach(([x, y]) => {
    b.box(1.6, 1.2, 0.7, 0xcfc8b4, x, yF + y, dB - 0.38);
    b.box(1.44, 1.04, 0.04, 0x15171a, x, yF + y, dB - 0.745);
  });
  // Mainframe cabinets.
  for (const s of [-1, 1]) {
    b.box(1.5, 2.7, 0.8, 0x8a9199, s * 4.9, yF + 1.35, dB - 0.42);
    b.box(1.3, 0.9, 0.02, 0x15171a, s * 4.9, yF + 2.05, dB - 0.83);
    b.box(1.3, 0.5, 0.02, 0x15171a, s * 4.9, yF + 0.9, dB - 0.83);
  }
  const shellMesh = b.build();
  group.add(shellMesh);

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(2 * G, H - 1.0),
    new THREE.MeshBasicMaterial({
      color: 0xbfe3ff,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glass.position.set(0, yF + 0.5 + (H - 1.0) / 2, 0.05);
  group.add(glass);

  const lamp = new THREE.PointLight(0xffe2b8, 26, 16, 1.6);
  lamp.position.set(0, yF + H - 0.5, 3.4);
  group.add(lamp);

  // Screens.
  let selected = 0;
  const screens = monitors.map((info, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 368;
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    disposables.push(tex);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.36, 0.98),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
    );
    const [x, y] = slots[i];
    mesh.position.set(x, yF + y, dB - 0.77);
    mesh.rotation.y = Math.PI;
    mesh.userData = { kind: "monitor", index: i };
    group.add(mesh);
    pickables.push(mesh);
    const draw = (hover: boolean) => {
      const on = i === selected;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = on ? "#0a2415" : "#06130c";
      ctx.fillRect(0, 0, w, h);
      const fg = on ? "#ffd166" : hover ? "#b8ffd6" : "#56e39a";
      ctx.fillStyle = fg;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.font = "700 30px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(on ? "● LIVE" : "○", w - 30, 54);
      ctx.textAlign = "left";
      ctx.font = "700 84px ui-monospace, Menlo, monospace";
      ctx.fillText(info.year, 30, 160);
      let size = 44;
      do {
        ctx.font = `700 ${size}px ui-monospace, Menlo, monospace`;
        size -= 2;
      } while (ctx.measureText(info.role).width > w - 60 && size > 20);
      ctx.fillText(info.role, 30, 232);
      ctx.font = "700 50px ui-monospace, Menlo, monospace";
      ctx.fillText(`@ ${info.co}`, 30, 304);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      for (let yy = 0; yy < h; yy += 4) ctx.fillRect(0, yy, w, 2);
      if (on || hover) {
        ctx.strokeStyle = fg;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, w - 8, h - 8);
      }
      tex.needsUpdate = true;
    };
    draw(false);
    return { mesh, draw };
  });

  // Stack ticker above the monitor wall.
  const tickerText = stack.join("   ●   ") + "   ●   ";
  const tickerTex = canvasTexture(2048, 64, (ctx, w, h) => {
    ctx.fillStyle = "#0b0b0a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4cf2a";
    ctx.textBaseline = "middle";
    let size = 40;
    do {
      ctx.font = `700 ${size}px ui-monospace, Menlo, monospace`;
      size -= 1;
    } while (ctx.measureText(tickerText).width > w && size > 12);
    const tw = ctx.measureText(tickerText).width;
    ctx.save();
    ctx.scale(w / tw, 1);
    ctx.fillText(tickerText, 0, h / 2 + 2);
    ctx.restore();
  });
  tickerTex.wrapS = THREE.RepeatWrapping;
  tickerTex.repeat.x = 0.42;
  disposables.push(tickerTex);
  const ticker = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 0.34),
    new THREE.MeshBasicMaterial({ map: tickerTex, toneMapped: false }),
  );
  ticker.position.set(0, yF + 3.45, dB - 0.03);
  ticker.rotation.y = Math.PI;
  group.add(ticker);

  // Mainframe lamps and tape reels.
  const blinkCanvas = document.createElement("canvas");
  blinkCanvas.width = 64;
  blinkCanvas.height = 24;
  const blinkCtx = blinkCanvas.getContext("2d")!;
  const blinkTex = new THREE.CanvasTexture(blinkCanvas);
  blinkTex.colorSpace = THREE.SRGBColorSpace;
  blinkTex.magFilter = THREE.NearestFilter;
  disposables.push(blinkTex);
  const reels: THREE.Mesh[] = [];
  const reelGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.04, 6);
  reelGeo.rotateX(Math.PI / 2);
  const reelMat = new THREE.MeshLambertMaterial({ color: 0xcfc8b4, flatShading: true });
  for (const s of [-1, 1]) {
    const blink = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.42),
      new THREE.MeshBasicMaterial({ map: blinkTex, toneMapped: false }),
    );
    blink.position.set(s * 4.9, yF + 0.9, dB - 0.845);
    blink.rotation.y = Math.PI;
    group.add(blink);
    for (const dx of [-0.32, 0.32]) {
      const reel = new THREE.Mesh(reelGeo, reelMat);
      reel.position.set(s * 4.9 + dx, yF + 2.05, dB - 0.86);
      group.add(reel);
      reels.push(reel);
    }
  }
  let blinkAt = 0;
  const drawBlink = () => {
    blinkCtx.fillStyle = "#0c0d0e";
    blinkCtx.fillRect(0, 0, 64, 24);
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 15; x++) {
        const r = Math.random();
        blinkCtx.fillStyle = r > 0.62 ? "#ffb347" : r > 0.5 ? "#ff5a4d" : "#2a1c10";
        blinkCtx.fillRect(2 + x * 4, 2 + y * 4.4, 3, 3);
      }
    }
    blinkTex.needsUpdate = true;
  };
  drawBlink();

  let hovered = -1;
  const update = (dt: number, t: number) => {
    tickerTex.offset.x = (t * 0.035) % 1;
    reels.forEach((r, i) => (r.rotation.z += dt * (i % 2 ? 1.6 : -2.2)));
    if (t > blinkAt) {
      blinkAt = t + 0.22;
      drawBlink();
    }
  };
  const setMonitor = (i: number) => {
    selected = i;
    screens.forEach((s, k) => s.draw(k === hovered));
  };
  const setHover = (i: number) => {
    if (i === hovered) return;
    hovered = i;
    screens.forEach((s, k) => s.draw(k === hovered));
  };
  return { group, update, setMonitor, setHover };
}

// ── Volunteering: the royal box at the south end ─────────────────────────

// Great Britain, Switzerland, Serbia, Spain.
function flagTexture(kind: number) {
  return canvasTexture(96, 64, (ctx, w, h) => {
    const stripes = (colors: string[], weights: number[]) => {
      const total = weights.reduce((a, b) => a + b, 0);
      let y = 0;
      colors.forEach((c, i) => {
        const sh = (weights[i] / total) * h;
        ctx.fillStyle = c;
        ctx.fillRect(0, y, w, sh + 1);
        y += sh;
      });
    };
    if (kind === 0) {
      ctx.fillStyle = "#012169";
      ctx.fillRect(0, 0, w, h);
      const diag = (color: string, width: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, h);
        ctx.moveTo(w, 0);
        ctx.lineTo(0, h);
        ctx.stroke();
      };
      diag("#ffffff", h * 0.2);
      diag("#c8102e", h * 0.067);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, h / 3, w, h / 3);
      ctx.fillRect(w / 2 - h / 6, 0, h / 3, h);
      ctx.fillStyle = "#c8102e";
      ctx.fillRect(0, h * 0.4, w, h * 0.2);
      ctx.fillRect(w / 2 - h * 0.1, 0, h * 0.2, h);
    } else if (kind === 1) {
      ctx.fillStyle = "#da291c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(w / 2 - h * 0.1, h * 0.2, h * 0.2, h * 0.6);
      ctx.fillRect(w / 2 - h * 0.3, h * 0.4, h * 0.6, h * 0.2);
    } else if (kind === 2) {
      stripes(["#c6363c", "#0c4076", "#ffffff"], [1, 1, 1]);
    } else {
      stripes(["#aa151b", "#f1bf00", "#aa151b"], [1, 2, 1]);
    }
  });
}

function buildVolunteering(
  photos: string[],
  disposables: { dispose: () => void }[],
  pickables: THREE.Object3D[],
) {
  const yF = 2.4;
  const dB = 8.5;
  const H = 5.0;
  const group = shellBlock(
    { yF, dB, yTop: yF + H, floor: 0x24483a, back: 0xe9e1cc },
    "VOLUNTEERING",
    disposables,
  );
  group.position.set(0, 0, K.ARENA_Z);

  const b = new Builder();
  // Carpet, wainscot, valance, side walls.
  b.box(4.2, 0.02, dB - 0.6, K.COLORS.purple, 0, yF + 0.07, dB / 2);
  b.box(2 * G - 0.4, 0.34, 0.08, 0x1d3a2d, 0, yF + 0.23, dB - 0.05);
  b.box(2 * G, 0.6, 0.3, K.COLORS.purple, 0, yF + H - 0.3, dB - 0.2);
  b.box(2 * G, 0.07, 0.32, K.COLORS.gold, 0, yF + H - 0.64, dB - 0.2);
  for (const s of [-1, 1]) {
    b.box(0.25, H, dB, 0x1d3a2d, s * (G - 0.12), yF + H / 2, dB / 2);
    b.box(0.7, H - 0.6, 0.25, K.COLORS.purple, s * (G - 0.6), yF + (H - 0.6) / 2, dB - 0.2);
  }
  // Front rail with planters.
  b.box(2 * G, 0.55, 0.3, 0x1d3a2d, 0, yF + 0.3, 0.2);
  // Wicker chairs with purple cushions.
  for (const z of [1.5, 2.9]) {
    for (let i = -4; i <= 4; i++) {
      const x = i * 1.25;
      b.box(0.62, 0.42, 0.56, 0x2d5140, x, yF + 0.27, z);
      b.box(0.62, 0.55, 0.1, 0x2d5140, x, yF + 0.72, z + 0.26);
      b.box(0.54, 0.07, 0.48, 0x5b3a82, x, yF + 0.51, z - 0.02);
    }
  }
  // Flag poles in the back corners, for the Model United Nations.
  // Seen from the court, +x is on the left: Great Britain, Switzerland, Serbia, Spain.
  const FLAG_X = [4.6, 3.75, -3.75, -4.6];
  for (const x of FLAG_X) {
    b.cyl(0.03, 0.035, 4.1, 0xd9d2bd, x, yF + 2.05, dB - 0.55);
    b.sphere(0.06, K.COLORS.gold, x, yF + 4.14, dB - 0.55);
    b.cyl(0.16, 0.2, 0.12, 0x1d3a2d, x, yF + 0.12, dB - 0.55);
  }
  group.add(b.build());

  const title = signTexture("YMCA MODEL UNITED NATIONS", 1024, 96);
  disposables.push(title);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 0.5),
    new THREE.MeshBasicMaterial({ map: title }),
  );
  plate.position.set(0, yF + H - 0.3, dB - 0.36);
  plate.rotation.y = Math.PI;
  group.add(plate);

  const lamp = new THREE.PointLight(0xfff0d8, 40, 18, 1.5);
  lamp.position.set(0, yF + 4.2, 3.6);
  group.add(lamp);

  // Flags.
  const flags: { geo: THREE.PlaneGeometry; base: Float32Array; phase: number }[] = [];
  FLAG_X.forEach((x, i) => {
    const geo = new THREE.PlaneGeometry(0.8, 0.56, 8, 2);
    geo.translate(0.4, 0, 0);
    const tex = flagTexture(i);
    disposables.push(tex);
    const flag = new THREE.Mesh(
      geo,
      new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }),
    );
    flag.position.set(x, yF + 3.78, dB - 0.55);
    // Fly toward the middle of the wall on both sides.
    flag.rotation.y = x > 0 ? Math.PI : 0;
    group.add(flag);
    flags.push({
      geo,
      base: (geo.attributes.position.array as Float32Array).slice(),
      phase: i * 1.3,
    });
  });

  // Framed photographs: two by two.
  const FW = 2.7;
  const FH = 1.8;
  const slots: [number, number][] = [
    [1.55, 3.3],
    [-1.55, 3.3],
    [1.55, 1.3],
    [-1.55, 1.3],
  ];
  const loader = new THREE.TextureLoader();
  let selected = 0;
  let hovered = -1;
  const frames = photos.map((url, i) => {
    const holder = new THREE.Group();
    const [x, y] = slots[i];
    holder.position.set(x, yF + y + 0.05, dB - 0.1);
    holder.rotation.y = Math.PI;
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(FW + 0.24, FH + 0.24, 0.1),
      new THREE.MeshLambertMaterial({ color: K.COLORS.gold }),
    );
    holder.add(border);
    const mat = new THREE.MeshBasicMaterial({ color: 0x3a4a42, toneMapped: false });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), mat);
    photo.position.z = 0.06;
    photo.userData = { kind: "photo", index: i };
    holder.add(photo);
    pickables.push(photo);
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      const img = tex.image as HTMLImageElement;
      const ai = img.width / img.height;
      const af = FW / FH;
      if (ai > af) {
        tex.repeat.x = af / ai;
        tex.offset.x = (1 - tex.repeat.x) / 2;
      } else {
        tex.repeat.y = ai / af;
        tex.offset.y = (1 - tex.repeat.y) / 2;
      }
      mat.map = tex;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
      disposables.push(tex);
    });
    group.add(holder);
    return { holder, border, mat, lift: 0 };
  });

  const dim = new THREE.Color();
  const update = (dt: number, t: number) => {
    for (const f of flags) {
      const p = f.geo.attributes.position;
      const arr = p.array as Float32Array;
      for (let i = 0; i < p.count; i++) {
        const x = f.base[i * 3];
        arr[i * 3 + 2] = Math.sin(x * 4.2 - t * 5 + f.phase) * 0.09 * x;
        arr[i * 3 + 1] = f.base[i * 3 + 1] + Math.sin(x * 3 - t * 4 + f.phase) * 0.03 * x;
      }
      p.needsUpdate = true;
    }
    frames.forEach((f, i) => {
      const target = i === selected ? 1 : i === hovered ? 0.4 : 0;
      f.lift += (target - f.lift) * Math.min(1, dt * 6);
      f.holder.scale.setScalar(1 + f.lift * 0.07);
      f.holder.position.z = dB - 0.1 - f.lift * 0.22;
      if (f.mat.map) {
        const v = 0.62 + 0.38 * Math.min(1, f.lift * 2.5);
        f.mat.color.copy(dim.setScalar(v));
      }
      (f.border.material as THREE.MeshLambertMaterial).emissive.setRGB(
        0.45 * f.lift,
        0.33 * f.lift,
        0.1 * f.lift,
      );
    });
  };
  const setPhoto = (i: number) => {
    selected = i;
  };
  const setHover = (i: number) => {
    hovered = i;
  };
  return { group, update, setPhoto, setHover };
}

export function buildAreas(input: {
  monitors: MonitorInfo[];
  stack: string[];
  photos: string[];
}): Areas & { setHover: (kind: string | null, index: number) => void } {
  const disposables: { dispose: () => void }[] = [];
  const pickables: THREE.Object3D[] = [];
  const group = new THREE.Group();
  const music = buildMusic(disposables);
  const software = buildSoftware(input.monitors, input.stack, disposables, pickables);
  const vol = buildVolunteering(input.photos, disposables, pickables);
  group.add(music.group, software.group, vol.group);

  return {
    group,
    pickables,
    update: (dt, t) => {
      music.update(dt, t);
      software.update(dt, t);
      vol.update(dt, t);
    },
    setMusic: music.setMusic,
    setMonitor: software.setMonitor,
    setPhoto: vol.setPhoto,
    setHover: (kind, index) => {
      software.setHover(kind === "monitor" ? index : -1);
      vol.setHover(kind === "photo" ? index : -1);
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    },
  };
}
