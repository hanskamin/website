import * as THREE from "three";
import * as K from "./constants";
import { Builder, canvasTexture } from "./builder";

type Node = { x: number; z: number; nx: number; nz: number; gapNext?: boolean };
type ProfSeg = {
  d0: number;
  h0: number;
  d1: number;
  h1: number;
  color: THREE.ColorRepresentation;
};

const CORNER_SEGS = 8;

/** Rounded-rectangle outline of the arena wall, with outward normals. */
function perimeter(): Node[] {
  const R = K.CORNER_R;
  const cx = K.ARENA_X - R;
  const cz = K.ARENA_Z - R;
  const g = K.GAP;
  const nodes: Node[] = [];
  const corner = (ox: number, oz: number, a0: number) => {
    for (let i = 0; i <= CORNER_SEGS; i++) {
      const a = a0 + (i / CORNER_SEGS) * (Math.PI / 2);
      nodes.push({
        x: ox + R * Math.cos(a),
        z: oz + R * Math.sin(a),
        nx: Math.cos(a),
        nz: Math.sin(a),
      });
    }
  };
  // North side (music pavilion in the gap).
  nodes.push({ x: -cx, z: -K.ARENA_Z, nx: 0, nz: -1 });
  nodes.push({ x: -g, z: -K.ARENA_Z, nx: 0, nz: -1, gapNext: true });
  nodes.push({ x: g, z: -K.ARENA_Z, nx: 0, nz: -1 });
  nodes.push({ x: cx, z: -K.ARENA_Z, nx: 0, nz: -1 });
  corner(cx, -cz, -Math.PI / 2);
  // East side.
  nodes.push({ x: K.ARENA_X, z: -cz, nx: 1, nz: 0 });
  nodes.push({ x: K.ARENA_X, z: cz, nx: 1, nz: 0 });
  corner(cx, cz, 0);
  // South side (royal box in the gap).
  nodes.push({ x: cx, z: K.ARENA_Z, nx: 0, nz: 1 });
  nodes.push({ x: g, z: K.ARENA_Z, nx: 0, nz: 1, gapNext: true });
  nodes.push({ x: -g, z: K.ARENA_Z, nx: 0, nz: 1 });
  nodes.push({ x: -cx, z: K.ARENA_Z, nx: 0, nz: 1 });
  corner(-cx, cz, Math.PI / 2);
  // West side (press box in the gap).
  nodes.push({ x: -K.ARENA_X, z: cz, nx: -1, nz: 0 });
  nodes.push({ x: -K.ARENA_X, z: g, nx: -1, nz: 0, gapNext: true });
  nodes.push({ x: -K.ARENA_X, z: -g, nx: -1, nz: 0 });
  nodes.push({ x: -K.ARENA_X, z: -cz, nx: -1, nz: 0 });
  corner(-cx, -cz, Math.PI);
  return nodes;
}

function standProfile(): ProfSeg[] {
  const segs: ProfSeg[] = [
    { d0: 0, h0: 0, d1: 0, h1: K.WALL_H, color: K.COLORS.wall },
    { d0: 0, h0: K.WALL_H, d1: K.LEDGE, h1: K.WALL_H, color: K.COLORS.wallDark },
  ];
  for (let i = 0; i < K.ROWS; i++) {
    const d = K.LEDGE + i * K.ROW_D;
    const h = K.WALL_H + i * K.ROW_H;
    segs.push({ d0: d, h0: h, d1: d, h1: h + K.ROW_H, color: K.COLORS.riser });
    segs.push({
      d0: d,
      h0: h + K.ROW_H,
      d1: d + K.ROW_D,
      h1: h + K.ROW_H,
      color: K.COLORS.tread,
    });
  }
  segs.push({
    d0: K.STAND_D,
    h0: K.STAND_H,
    d1: K.SHELL_D,
    h1: K.STAND_H,
    color: K.COLORS.tread,
  });
  return segs;
}

function shellProfile(): ProfSeg[] {
  const under = K.ROOF_IN_H - K.FASCIA;
  return [
    // Outer wall behind the last row.
    { d0: K.SHELL_D, h0: 0, d1: K.SHELL_D, h1: K.ROOF_H, color: K.COLORS.wallDark },
    // Roof top, fascia, underside.
    { d0: K.SHELL_D, h0: K.ROOF_H, d1: K.ROOF_IN_D, h1: K.ROOF_IN_H, color: K.COLORS.roofTop },
    { d0: K.ROOF_IN_D, h0: K.ROOF_IN_H, d1: K.ROOF_IN_D, h1: under, color: K.COLORS.wall },
    { d0: K.ROOF_IN_D, h0: under, d1: K.SHELL_D - 0.1, h1: K.ROOF_H - 0.9, color: K.COLORS.roofUnder },
  ];
}

function sweep(nodes: Node[], prof: ProfSeg[], skipGaps: boolean) {
  const pos: number[] = [];
  const col: number[] = [];
  const c = new THREE.Color();
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % n];
    if (skipGaps && a.gapNext) continue;
    if (Math.hypot(a.x - b.x, a.z - b.z) < 1e-4) continue;
    for (const s of prof) {
      c.set(s.color);
      const ax0 = a.x + a.nx * s.d0;
      const az0 = a.z + a.nz * s.d0;
      const ax1 = a.x + a.nx * s.d1;
      const az1 = a.z + a.nz * s.d1;
      const bx0 = b.x + b.nx * s.d0;
      const bz0 = b.z + b.nz * s.d0;
      const bx1 = b.x + b.nx * s.d1;
      const bz1 = b.z + b.nz * s.d1;
      pos.push(
        ax0, s.h0, az0, bx0, s.h0, bz0, bx1, s.h1, bz1,
        ax0, s.h0, az0, bx1, s.h1, bz1, ax1, s.h1, az1,
      );
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Flat wall that closes the cut end of a stand next to a pavilion. */
function standEndWall() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, K.WALL_H);
  shape.lineTo(K.LEDGE, K.WALL_H);
  for (let i = 0; i < K.ROWS; i++) {
    const d = K.LEDGE + i * K.ROW_D;
    const h = K.WALL_H + i * K.ROW_H;
    shape.lineTo(d, h + K.ROW_H);
    shape.lineTo(d + K.ROW_D, h + K.ROW_H);
  }
  shape.lineTo(K.SHELL_D, K.STAND_H);
  shape.lineTo(K.SHELL_D, 0);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function grassTexture() {
  const W = 2 * K.ARENA_X + 2;
  const L = 2 * K.ARENA_Z + 2;
  const tex = canvasTexture(512, 1024, (ctx, w, h) => {
    const sx = w / W;
    const sz = h / L;
    ctx.fillStyle = "#5c9140";
    ctx.fillRect(0, 0, w, h);
    // Mowing stripes run the length of the court.
    const stripe = 1.3716;
    for (let i = -10; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#679e47" : "#568a3b";
      ctx.fillRect((W / 2 + i * stripe) * sx, 0, stripe * sx, h);
    }
    // Speckle.
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,200" : "20,50,10"},${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 3);
    }
    // Second-week wear: the baselines and the serve-and-volley path.
    const wear = (
      mx: number,
      mz: number,
      rx: number,
      rz: number,
      alpha: number,
    ) => {
      const cx = (W / 2 + mx) * sx;
      const cz = (L / 2 + mz) * sz;
      ctx.save();
      ctx.translate(cx, cz);
      ctx.scale(rx * sx, rz * sz);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(150,138,84,${alpha})`);
      g.addColorStop(0.55, `rgba(132,134,78,${alpha * 0.5})`);
      g.addColorStop(1, "rgba(110,130,70,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    };
    for (const s of [-1, 1]) {
      wear(0, s * (K.HALF_LEN + 0.3), 5.0, 1.5, 0.7);
      wear(0, s * (K.HALF_LEN - 2.5), 2.0, 3.0, 0.25);
      wear(0, s * K.SERVICE_Z, 2.4, 2.0, 0.3);
      wear(0, s * 2.6, 3.2, 1.8, 0.22);
    }
  });
  return { tex, W, L };
}

function courtLines() {
  const pos: number[] = [];
  const y = 0.012;
  const quad = (x0: number, z0: number, x1: number, z1: number) => {
    pos.push(x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0);
  };
  const t = 0.05;
  const bt = 0.1;
  for (const s of [-1, 1]) {
    // Baselines.
    quad(-K.HALF_W, s * K.HALF_LEN - bt / 2, K.HALF_W, s * K.HALF_LEN + bt / 2);
    // Service lines.
    quad(-K.SINGLES_W, s * K.SERVICE_Z - t / 2, K.SINGLES_W, s * K.SERVICE_Z + t / 2);
    // Centre marks.
    quad(-t / 2, s * K.HALF_LEN - (s > 0 ? 0.2 : 0), t / 2, s * K.HALF_LEN + (s > 0 ? 0 : 0.2));
    // Sidelines (doubles and singles).
    quad(s * K.HALF_W - t / 2, -K.HALF_LEN, s * K.HALF_W + t / 2, K.HALF_LEN);
    quad(s * K.SINGLES_W - t / 2, -K.HALF_LEN, s * K.SINGLES_W + t / 2, K.HALF_LEN);
  }
  // Centre service line.
  quad(-t / 2, -K.SERVICE_Z, t / 2, K.SERVICE_Z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({
    color: K.COLORS.line,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  return mesh;
}

function net() {
  const group = new THREE.Group();
  const cell = canvasTexture(32, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(18,22,18,0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, h);
  });
  cell.wrapS = cell.wrapT = THREE.RepeatWrapping;
  cell.repeat.set(2 * K.NET_POST_X * 14, 12);
  const segs = 24;
  const geo = new THREE.PlaneGeometry(2 * K.NET_POST_X, 1, segs, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const top = netHeightAt(x);
    p.setY(i, p.getY(i) > 0 ? top : 0.02);
  }
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      map: cell,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = 2;
  group.add(mesh);

  // White tape along the top.
  const tapePos: number[] = [];
  for (let i = 0; i < segs; i++) {
    const x0 = -K.NET_POST_X + (i / segs) * 2 * K.NET_POST_X;
    const x1 = -K.NET_POST_X + ((i + 1) / segs) * 2 * K.NET_POST_X;
    const y0 = netHeightAt(x0);
    const y1 = netHeightAt(x1);
    tapePos.push(
      x0, y0 - 0.07, 0, x1, y1 - 0.07, 0, x1, y1, 0,
      x0, y0 - 0.07, 0, x1, y1, 0, x0, y0, 0,
    );
  }
  const tapeGeo = new THREE.BufferGeometry();
  tapeGeo.setAttribute("position", new THREE.Float32BufferAttribute(tapePos, 3));
  const white = new THREE.MeshBasicMaterial({ color: 0xf4f2e8, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(tapeGeo, white));
  const strap = new THREE.Mesh(new THREE.PlaneGeometry(0.06, K.NET_H), white);
  strap.position.set(0, K.NET_H / 2, 0);
  group.add(strap);

  const b = new Builder();
  for (const s of [-1, 1]) {
    b.cyl(0.05, 0.05, K.NET_POST_H + 0.02, 0x2a2a26, s * K.NET_POST_X, K.NET_POST_H / 2, 0);
  }
  group.add(b.build());
  return group;
}

export function netHeightAt(x: number) {
  const t = Math.min(1, Math.abs(x) / K.NET_POST_X);
  return K.NET_H + (K.NET_POST_H - K.NET_H) * t * t;
}

/** A small static person made of boxes, for officials and ball kids. */
function figure(
  b: Builder,
  x: number,
  z: number,
  facing: number,
  o: { top: number; bottom: number; hat?: number; seated?: boolean; kneel?: boolean; y?: number },
) {
  const m = new THREE.Matrix4()
    .makeRotationY(facing)
    .setPosition(x, o.y ?? 0, z);
  const skin = 0xe2b48c;
  b.sub(m, () => {
    if (o.seated) {
      b.box(0.36, 0.14, 0.42, o.bottom, 0, 0.5, 0.12);
      b.box(0.13, 0.46, 0.13, o.bottom, -0.1, 0.23, 0.3);
      b.box(0.13, 0.46, 0.13, o.bottom, 0.1, 0.23, 0.3);
      b.box(0.4, 0.52, 0.24, o.top, 0, 0.84, 0);
      b.sphere(0.115, skin, 0, 1.24, 0.01);
      if (o.hat !== undefined) b.cyl(0.13, 0.15, 0.07, o.hat, 0, 1.34, 0);
    } else if (o.kneel) {
      b.box(0.34, 0.2, 0.5, o.bottom, 0, 0.16, -0.08);
      b.box(0.38, 0.46, 0.24, o.top, 0, 0.56, 0.05);
      b.sphere(0.11, skin, 0, 0.93, 0.07);
    } else {
      b.box(0.14, 0.8, 0.16, o.bottom, -0.1, 0.4, 0);
      b.box(0.14, 0.8, 0.16, o.bottom, 0.1, 0.4, 0);
      b.box(0.4, 0.56, 0.24, o.top, 0, 1.08, 0);
      b.sphere(0.115, skin, 0, 1.5, 0.01);
      if (o.hat !== undefined) b.cyl(0.13, 0.15, 0.07, o.hat, 0, 1.6, 0);
    }
  });
}

function officials() {
  const b = new Builder();
  // Umpire chair on the east side of the net.
  const ux = K.NET_POST_X + 1.0;
  for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) {
    b.cyl(0.035, 0.045, 1.9, 0x24452f, ux + dx, 0.95, dz);
  }
  b.box(0.9, 0.08, 0.9, 0x24452f, ux, 1.9, 0);
  b.box(0.08, 0.7, 0.9, 0x24452f, ux + 0.42, 2.25, 0);
  for (let i = 0; i < 4; i++) b.box(0.5, 0.04, 0.05, 0x24452f, ux - 0.45, 0.4 + i * 0.4, 0);
  figure(b, ux + 0.1, 0, -Math.PI / 2, { top: 0x2c4f3c, bottom: 0xd9d2bd, seated: true, y: 1.45 });

  // Player benches, towels, the water cooler.
  for (const s of [-1, 1]) {
    b.box(0.5, 0.06, 1.3, 0x24452f, ux + 0.3, 0.45, s * 2.6);
    b.box(0.06, 0.5, 1.3, 0x24452f, ux + 0.55, 0.7, s * 2.6);
    b.box(0.4, 0.05, 0.5, 0xf2efe6, ux + 0.3, 0.5, s * 2.9);
    b.box(0.3, 0.3, 0.6, s > 0 ? 0xb0282e : 0x1f3f7a, ux + 0.25, 0.15, s * 2.0);
  }

  // Line judges, in the green jackets and hats of the era.
  const lj = { top: 0x35603f, bottom: 0xd9d2bd, hat: 0xe9e3cf, seated: true };
  const chair = (x: number, z: number) => b.box(0.44, 0.45, 0.44, 0x1c3a2b, x, 0.225, z);
  const judges: [number, number, number][] = [
    [-K.SINGLES_W, K.ARENA_Z - 1.2, Math.PI],
    [K.SINGLES_W, K.ARENA_Z - 1.2, Math.PI],
    [-K.SINGLES_W, -K.ARENA_Z + 1.2, 0],
    [K.SINGLES_W, -K.ARENA_Z + 1.2, 0],
    [-K.ARENA_X + 1.1, K.HALF_LEN, Math.PI / 2],
    [-K.ARENA_X + 1.1, -K.HALF_LEN, Math.PI / 2],
    [-K.ARENA_X + 1.1, K.SERVICE_Z, Math.PI / 2],
    [-K.ARENA_X + 1.1, -K.SERVICE_Z, Math.PI / 2],
    [K.ARENA_X - 1.1, K.HALF_LEN, -Math.PI / 2],
    [K.ARENA_X - 1.1, -K.HALF_LEN, -Math.PI / 2],
  ];
  for (const [x, z, f] of judges) {
    chair(x, z);
    figure(b, x, z, f, lj);
  }

  // Ball kids in purple and green.
  const kid = { top: 0x4b2a6b, bottom: 0x1f4a36 };
  figure(b, -K.NET_POST_X - 0.7, 0.5, Math.PI / 2, { ...kid, kneel: true });
  figure(b, K.NET_POST_X + 2.2, -0.9, -Math.PI / 2, { ...kid, kneel: true });
  for (const sx of [-1, 1]) {
    figure(b, sx * (K.ARENA_X - 1.6), K.ARENA_Z - 0.9, Math.PI, kid);
    figure(b, sx * (K.ARENA_X - 1.6), -K.ARENA_Z + 0.9, 0, kid);
  }
  return b.build();
}

function crowd(nodes: Node[], spacing: number, uniforms: CrowdUniforms) {
  const seats: { x: number; y: number; z: number; rot: number }[] = [];
  const n = nodes.length;
  for (let r = 0; r < K.ROWS; r++) {
    const d = K.LEDGE + r * K.ROW_D + 0.42;
    const y = K.WALL_H + (r + 1) * K.ROW_H;
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      const b = nodes[(i + 1) % n];
      if (a.gapNext) continue;
      const ax = a.x + a.nx * d;
      const az = a.z + a.nz * d;
      const bx = b.x + b.nx * d;
      const bz = b.z + b.nz * d;
      const len = Math.hypot(bx - ax, bz - az);
      const count = Math.floor(len / spacing);
      for (let k = 0; k < count; k++) {
        if (Math.random() < 0.045) continue;
        const t = (k + 0.5 + (Math.random() - 0.5) * 0.3) / count;
        const nx = a.nx + (b.nx - a.nx) * t;
        const nz = a.nz + (b.nz - a.nz) * t;
        seats.push({
          x: ax + (bx - ax) * t,
          y,
          z: az + (bz - az) * t,
          rot: Math.atan2(-nx, -nz),
        });
      }
    }
  }

  // Seated torso: narrow at the shoulders, so that rows do not read as a wall.
  const bodyGeo = new THREE.CylinderGeometry(0.14, 0.21, 0.5, 7);
  bodyGeo.scale(1, 1, 0.8);
  bodyGeo.translate(0, 0.25, 0);
  const headGeo = new THREE.IcosahedronGeometry(0.125, 1);
  headGeo.translate(0, 0.63, 0.02);

  const makeMat = () => {
    const mat = new THREE.MeshLambertMaterial();
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uCheer = uniforms.uCheer;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uTime;\nuniform float uCheer;",
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            float hsh = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);
            float clap = abs(sin(uTime * (7.0 + hsh * 5.0) + hsh * 30.0));
            transformed.y += 0.012 * sin(uTime * 1.3 + hsh * 40.0)
              + uCheer * ((0.05 + 0.1 * hsh) * clap + step(0.62, hsh) * 0.3);
          #endif`,
        );
    };
    return mat;
  };

  const bodies = new THREE.InstancedMesh(bodyGeo, makeMat(), seats.length);
  const heads = new THREE.InstancedMesh(headGeo, makeMat(), seats.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  // A 1980 summer crowd: mostly whites, creams and pastels.
  const clothes = [
    0xf3efe4, 0xeee6d2, 0xe8e2d4, 0xfaf7ee, 0xcfdcea, 0xa9c4de, 0x7fa3c7,
    0xe9c7c9, 0xd98a8f, 0xf0dc9a, 0xb9d4b4, 0x27406b, 0x1f2f4d, 0x9c2f35,
    0x6e7f8c, 0xd8cdb8, 0x3d6b52, 0xc98d6a, 0x54463a, 0x8b6f9c, 0x2e2e33,
  ];
  const skins = [0xe8bf9c, 0xdcae88, 0xc99672, 0xf0cdb0, 0x9a6a48];
  const hats = [0xf7f2e2, 0xefe4c4, 0xf7f2e2, 0xd9c48f];
  seats.forEach((seat, i) => {
    const sc = 0.86 + Math.random() * 0.26;
    q.setFromAxisAngle(up, seat.rot + (Math.random() - 0.5) * 0.3);
    p.set(seat.x, seat.y, seat.z);
    s.set(1, sc, 1);
    m.compose(p, q, s);
    bodies.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
    c.set(clothes[(Math.random() * clothes.length) | 0]);
    c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
    bodies.setColorAt(i, c);
    c.set(
      Math.random() < 0.24
        ? hats[(Math.random() * hats.length) | 0]
        : skins[(Math.random() * skins.length) | 0],
    );
    heads.setColorAt(i, c);
  });
  bodies.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;
  bodies.receiveShadow = true;
  heads.receiveShadow = true;
  bodies.frustumCulled = false;
  heads.frustumCulled = false;
  return [bodies, heads];
}

function flowers(nodes: Node[]) {
  const pts: { x: number; z: number }[] = [];
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % n];
    if (a.gapNext) continue;
    const d = 0.17;
    const ax = a.x + a.nx * d;
    const az = a.z + a.nz * d;
    const bx = b.x + b.nx * d;
    const bz = b.z + b.nz * d;
    const count = Math.floor(Math.hypot(bx - ax, bz - az) / 0.3);
    for (let k = 0; k < count; k++) {
      const t = (k + 0.5) / count;
      pts.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t });
    }
  }
  const mesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.13, 0),
    new THREE.MeshLambertMaterial(),
    pts.length,
  );
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  const palette = [0x6d3fa0, 0x8552b8, 0xf4f1f6, 0x2f6b3c, 0x2f6b3c, 0x5a2d86];
  pts.forEach((pt, i) => {
    m.makeScale(1, 0.8 + Math.random() * 0.5, 1);
    m.setPosition(pt.x, K.WALL_H + 0.07, pt.z);
    mesh.setMatrixAt(i, m);
    c.set(palette[(Math.random() * palette.length) | 0]);
    mesh.setColorAt(i, c);
  });
  return mesh;
}

function sky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {},
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vDir;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 col = mix(vec3(0.80,0.88,0.95), vec3(0.30,0.55,0.86), pow(h, 0.55));
        vec2 uv = vDir.xz / (vDir.y + 0.25) * 1.6;
        float n = noise(uv) * 0.6 + noise(uv * 2.3) * 0.3 + noise(uv * 5.0) * 0.1;
        float cloud = smoothstep(0.56, 0.78, n) * smoothstep(0.02, 0.3, vDir.y);
        col = mix(col, vec3(1.0), cloud * 0.85);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), mat);
  mesh.frustumCulled = false;
  return mesh;
}

export type CrowdUniforms = {
  uTime: { value: number };
  uCheer: { value: number };
};

export type ScoreboardState = {
  borg: string;
  mac: string;
  serving: "mac" | "borg";
};

function drawScoreboard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: ScoreboardState,
) {
  ctx.fillStyle = "#0b0b0a";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#1d4a37";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  const yellow = "#f4cf2a";
  ctx.fillStyle = yellow;
  ctx.textBaseline = "middle";
  ctx.font = "700 24px ui-monospace, Menlo, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.fillText("PREVIOUS SETS", 300, 52);
  ctx.textAlign = "center";
  ctx.fillText("GAMES", 548, 52);
  ctx.fillText("POINTS", 664, 52);
  const row = (
    y: number,
    name: string,
    sets: string[],
    games: string,
    pts: string,
    serving: boolean,
  ) => {
    ctx.font = "700 48px ui-monospace, Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = yellow;
    ctx.fillText(name, 62, y);
    if (serving) {
      ctx.beginPath();
      ctx.arc(38, y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = "center";
    sets.forEach((v, i) => ctx.fillText(v, 320 + i * 50, y));
    ctx.fillText(games, 548, y);
    ctx.fillStyle = "#fff3b0";
    ctx.fillText(pts, 664, y);
  };
  row(128, "BORG", ["1", "7", "6", "6"], "7", s.borg, s.serving === "borg");
  row(212, "McENROE", ["6", "5", "3", "7"], "6", s.mac, s.serving === "mac");
  ctx.strokeStyle = "rgba(244,207,42,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 170);
  ctx.lineTo(w - 30, 170);
  ctx.stroke();
}

export type Stadium = {
  group: THREE.Group;
  crowd: CrowdUniforms;
  setScore: (s: ScoreboardState) => void;
  dispose: () => void;
};

export function buildStadium(opts: { lowPower: boolean }): Stadium {
  const group = new THREE.Group();
  const nodes = perimeter();
  const uniforms: CrowdUniforms = { uTime: { value: 0 }, uCheer: { value: 0 } };

  group.add(sky());

  // Grass.
  const { tex: grassTex, W, L } = grassTexture();
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(W, L),
    new THREE.MeshLambertMaterial({ map: grassTex }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  group.add(grass);
  group.add(courtLines());
  group.add(net());
  group.add(officials());

  // Stands and roof.
  const sideMat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  const stands = new THREE.Mesh(sweep(nodes, standProfile(), true), sideMat);
  stands.receiveShadow = true;
  stands.castShadow = true;
  group.add(stands);
  const shell = new THREE.Mesh(sweep(nodes, shellProfile(), false), sideMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  group.add(shell);

  // Close the cut ends of the stands on each side of a pavilion.
  const endGeo = standEndWall();
  const endMat = new THREE.MeshLambertMaterial({
    color: K.COLORS.wall,
    side: THREE.DoubleSide,
  });
  const ends: [number, number, number][] = [
    [-K.GAP, -K.ARENA_Z, Math.PI / 2],
    [K.GAP, -K.ARENA_Z, Math.PI / 2],
    [-K.GAP, K.ARENA_Z, -Math.PI / 2],
    [K.GAP, K.ARENA_Z, -Math.PI / 2],
    [-K.ARENA_X, -K.GAP, Math.PI],
    [-K.ARENA_X, K.GAP, Math.PI],
  ];
  for (const [x, z, ry] of ends) {
    const wall = new THREE.Mesh(endGeo, endMat);
    wall.position.set(x, 0, z);
    wall.rotation.y = ry;
    wall.receiveShadow = true;
    group.add(wall);
  }

  crowd(nodes, opts.lowPower ? 0.74 : 0.56, uniforms).forEach((m) => group.add(m));
  group.add(flowers(nodes));

  // Two scoreboards, black with yellow figures, on the far corners.
  const sbCanvas = document.createElement("canvas");
  sbCanvas.width = 768;
  sbCanvas.height = 272;
  const sbCtx = sbCanvas.getContext("2d")!;
  const sbTex = new THREE.CanvasTexture(sbCanvas);
  sbTex.colorSpace = THREE.SRGBColorSpace;
  sbTex.anisotropy = 8;
  const setScore = (s: ScoreboardState) => {
    drawScoreboard(sbCtx, sbCanvas.width, sbCanvas.height, s);
    sbTex.needsUpdate = true;
  };
  setScore({ borg: "0", mac: "0", serving: "mac" });
  const sbMat = new THREE.MeshBasicMaterial({ map: sbTex });
  const boardBuilder = new Builder();
  for (const sx of [-1, 1]) {
    const d = 9.2;
    const a = Math.SQRT1_2;
    const x = sx * (K.ARENA_X - K.CORNER_R + (K.CORNER_R + d) * a);
    const z = -(K.ARENA_Z - K.CORNER_R + (K.CORNER_R + d) * a);
    const y = K.WALL_H + (d / K.ROW_D) * K.ROW_H + 2.3;
    const board = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 2.7), sbMat);
    board.position.set(x, y, z);
    board.lookAt(0, y - 2, 6);
    group.add(board);
    const back = new THREE.Object3D();
    back.position.copy(board.position);
    back.quaternion.copy(board.quaternion);
    back.translateZ(-0.25);
    boardBuilder.box(8.0, 3.1, 0.4, 0x0d2a1f, back.position.x, back.position.y, back.position.z, [
      back.rotation.x,
      back.rotation.y,
      back.rotation.z,
    ]);
  }
  const boardBacks = boardBuilder.build();
  boardBacks.castShadow = false;
  group.add(boardBacks);

  const dispose = () => {
    group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    grassTex.dispose();
    sbTex.dispose();
  };

  return { group, crowd: uniforms, setScore, dispose };
}
