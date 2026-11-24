import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type V3 = [number, number, number];

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();

/**
 * Collects many static primitives and merges them into one vertex-coloured
 * mesh, so that a full set of props costs one draw call.
 */
export class Builder {
  private parts: THREE.BufferGeometry[] = [];
  private base = new THREE.Matrix4();

  constructor(base?: THREE.Matrix4) {
    if (base) this.base.copy(base);
  }

  /** Runs `fn` with an extra local transform applied to everything it adds. */
  sub(local: THREE.Matrix4, fn: () => void) {
    const saved = this.base.clone();
    this.base.multiply(local);
    fn();
    this.base.copy(saved);
    return this;
  }

  add(
    geo: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    pos: V3,
    rot: V3 = [0, 0, 0],
    scale: V3 = [1, 1, 1],
  ) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    tmpE.set(rot[0], rot[1], rot[2]);
    tmpQ.setFromEuler(tmpE);
    tmpP.set(pos[0], pos[1], pos[2]);
    tmpS.set(scale[0], scale[1], scale[2]);
    tmpM.compose(tmpP, tmpQ, tmpS).premultiply(this.base);
    g.applyMatrix4(tmpM);
    const c = new THREE.Color(color);
    const n = g.attributes.position.count;
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.deleteAttribute("uv");
    this.parts.push(g);
    geo.dispose();
    return this;
  }

  box(
    w: number,
    h: number,
    d: number,
    color: THREE.ColorRepresentation,
    x: number,
    y: number,
    z: number,
    rot?: V3,
  ) {
    return this.add(new THREE.BoxGeometry(w, h, d), color, [x, y, z], rot);
  }

  cyl(
    rTop: number,
    rBottom: number,
    h: number,
    color: THREE.ColorRepresentation,
    x: number,
    y: number,
    z: number,
    rot?: V3,
    seg = 12,
  ) {
    return this.add(
      new THREE.CylinderGeometry(rTop, rBottom, h, seg),
      color,
      [x, y, z],
      rot,
    );
  }

  sphere(
    r: number,
    color: THREE.ColorRepresentation,
    x: number,
    y: number,
    z: number,
    scale?: V3,
  ) {
    return this.add(
      new THREE.SphereGeometry(r, 12, 8),
      color,
      [x, y, z],
      undefined,
      scale,
    );
  }

  build(material?: THREE.Material): THREE.Mesh {
    const geo = mergeGeometries(this.parts, false);
    this.parts.forEach((p) => p.dispose());
    this.parts = [];
    const mesh = new THREE.Mesh(
      geo,
      material ?? new THREE.MeshLambertMaterial({ vertexColors: true }),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}

export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Gold serif lettering on club green: the stadium wayfinding signs. */
export function signTexture(text: string, w = 1024, h = 160) {
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = "#0e2e22";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d8b25a";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#e6c574";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = h * 0.52;
    const spaced = text.split("").join("  ");
    do {
      ctx.font = `600 ${size}px Georgia, "Times New Roman", serif`;
      size -= 4;
    } while (ctx.measureText(spaced).width > w - 80 && size > 20);
    ctx.fillText(spaced, w / 2, h / 2 + 4);
  });
}
