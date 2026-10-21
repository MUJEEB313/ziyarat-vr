import { EYE, HALL, HALL_EYE } from "./build";
import { hexToRgb, type SkyPalette } from "./palette";
import type { SceneSpec } from "./types";

type RGB = [number, number, number];

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise in [0, 1). */
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Fade fine detail to its average with distance so the horizon doesn't shimmer. */
const detail = (dist: number, near = 10, far = 40) => clamp01(1 - (dist - near) / (far - near));

function marble(spec: Extract<SceneSpec, { kind: "courtyard" }>, x: number, z: number, dist: number): RGB {
  const base: RGB = [236, 230, 218];
  const inlay = hexToRgb(spec.inlay);
  const line: RGB = [150, 112, 48];
  const u = x / 3;
  const v = z / 3;
  const fu = u - Math.floor(u) - 0.5;
  const fv = v - Math.floor(v) - 0.5;
  const a = Math.abs(fu);
  const b = Math.abs(fv);
  const s = Math.min((a + b - 0.36) * 0.707, Math.max(a, b) - 0.255);
  let c: RGB = s < 0 ? inlay : base;
  if (Math.abs(s) < 0.011) c = line;
  if (0.5 - Math.max(a, b) < 0.007) c = [205, 198, 186];
  const n = noise(x * 1.7, z * 1.7) * 0.12 + noise(x * 6, z * 6) * 0.05;
  c = [c[0] * (0.92 + n), c[1] * (0.92 + n), c[2] * (0.92 + n)];
  return mix(mix(base, inlay, 0.22), c, detail(dist));
}

function roadGround(x: number, z: number, dist: number): RGB {
  const ax = Math.abs(x);
  const n = noise(x * 2, z * 2) * 0.15 + noise(x * 9, z * 9) * 0.08;
  let c: RGB;
  if (ax < 3.4) {
    c = [62, 63, 66];
    if (ax < 0.09 && z / 6 - Math.floor(z / 6) < 0.5) c = [222, 220, 210];
  } else if (ax < 3.75) {
    c = Math.floor(z) % 2 === 0 ? [235, 232, 220] : [40, 40, 42];
  } else {
    c = [201, 173, 128];
  }
  c = [c[0] * (0.9 + n), c[1] * (0.9 + n), c[2] * (0.9 + n)];
  const avg: RGB = ax < 3.4 ? [66, 67, 70] : [196, 170, 126];
  return mix(avg, c, detail(dist, 14, 60));
}

function plainGround(spec: Extract<SceneSpec, { kind: "plain" }>, x: number, z: number, dist: number, horizon: RGB): RGB {
  const n = noise(x * 0.8, z * 0.8) * 0.18 + noise(x * 5, z * 5) * 0.08;
  if (spec.river) {
    if (z < -62 && z > -78) {
      const ripple = noise(x * 0.6, z * 3) * 0.25;
      return mix([26, 52, 70], horizon, 0.55 + ripple);
    }
    if ((z <= -58 && z >= -62) || (z <= -78 && z >= -86)) return [77 * (0.9 + n), 104 * (0.9 + n), 52 * (0.9 + n)];
  }
  const base: RGB = spec.wall ? [216, 199, 165] : [204, 176, 128];
  return mix(base, [base[0] * (0.88 + n), base[1] * (0.88 + n), base[2] * (0.88 + n)], detail(dist, 8, 60));
}

function hallSurface(lon: number, tanLat: number): RGB {
  const hxd = -Math.sin(lon);
  const hzd = Math.cos(lon);
  const tx = HALL.hx / Math.max(Math.abs(hxd), 1e-6);
  const tz = HALL.hz / Math.max(Math.abs(hzd), 1e-6);
  const t = Math.min(tx, tz);
  const wy = t * tanLat + HALL_EYE;
  if (wy < 0) {
    const dist = HALL_EYE / -tanLat;
    const x = hxd * dist;
    const z = hzd * dist;
    const zz = (z + 100) % 1.2;
    let c: RGB = [122, 22, 34];
    if (zz < 0.07) c = [199, 154, 58];
    else {
      const fu = ((x + 100) % 1.0) - 0.5;
      const fv = zz / 1.2 - 0.5;
      const d = Math.abs(fu) + Math.abs(fv);
      if (d < 0.11) c = [212, 178, 90];
      else if (d < 0.3) c = [30, 58, 90];
      else if (d < 0.33) c = [199, 154, 58];
    }
    const n = noise(x * 8, z * 8) * 0.1;
    return mix([110, 32, 40], [c[0] * (0.92 + n), c[1] * (0.92 + n), c[2] * (0.92 + n)], detail(dist, 6, 16));
  }
  if (wy > HALL.height) {
    const dist = (HALL.height - HALL_EYE) / tanLat;
    const x = hxd * dist;
    const z = hzd * dist;
    const gx = Math.abs(((x + 100) % 2) - 1);
    const gz = Math.abs(((z + 100) % 2) - 1);
    const coffer = gx > 0.93 || gz > 0.93 ? 0.8 : 1;
    const warm = 1 + 0.25 * Math.exp(-(x * x + z * z) / 40);
    return [232 * coffer * warm * 0.75, 222 * coffer * warm * 0.72, 200 * coffer * 0.68];
  }
  const u = tx < tz ? hzd * t : hxd * t;
  if (wy < 0.45) return [48, 32, 22];
  if (wy < 3.4) {
    const fold = 0.85 + 0.15 * Math.sin(u * 7);
    return [22 * fold, 20 * fold, 24 * fold];
  }
  if (wy < 3.52 || (wy > 3.84 && wy < 3.94)) return [184, 146, 63];
  if (wy < 3.84) return [16, 92, 54];
  const arch = Math.abs(((u + 100) % 2.2) - 1.1) < 0.6 && wy > 4.15 && wy < 5.0 ? 0.82 : 1;
  return [200 * arch, 190 * arch, 168 * arch];
}

/**
 * Paint the ground (and, for halls, every surface) per pixel into an
 * equirectangular RGBA buffer of width W and height H.
 */
export function paintGround(spec: SceneSpec, img: Uint8ClampedArray, W: number, H: number, pal: SkyPalette) {
  const sinLon = new Float32Array(W);
  const cosLon = new Float32Array(W);
  for (let i = 0; i < W; i++) {
    const lon = ((i + 0.5) / W) * Math.PI * 2;
    sinLon[i] = Math.sin(lon);
    cosLon[i] = Math.cos(lon);
  }
  const horizon = hexToRgb(pal.horizon);
  const startRow = spec.kind === "hall" ? 0 : H / 2;
  const mainLon = spec.kind === "courtyard" ? ((spec.shrines[0]?.lon ?? 180) * Math.PI) / 180 : Math.PI;

  for (let j = startRow; j < H; j++) {
    const lat = (0.5 - (j + 0.5) / H) * Math.PI;
    const tanLat = Math.tan(lat);
    for (let i = 0; i < W; i++) {
      let c: RGB;
      if (spec.kind === "hall") {
        c = hallSurface(((i + 0.5) / W) * Math.PI * 2, tanLat);
      } else {
        const dist = EYE / -tanLat;
        const x = -sinLon[i] * dist;
        const z = cosLon[i] * dist;
        if (spec.kind === "courtyard") c = marble(spec, x, z, dist);
        else if (spec.kind === "road") c = roadGround(x, z, dist);
        else c = plainGround(spec, x, z, dist, horizon);

        let r = c[0] * pal.light * pal.tint[0];
        let g = c[1] * pal.light * pal.tint[1];
        let b = c[2] * pal.light * pal.tint[2];

        if (pal.lit) {
          let glow = 0;
          if (spec.kind === "courtyard") {
            // Lamp pools along the walkway and the golden reflection of the dome.
            const dx = Math.abs(x) - 6.5;
            const lz = z < 0 ? -(8 + 9 * Math.min(4, Math.max(0, Math.round((-z - 8) / 9)))) : 10 + 10 * Math.min(3, Math.max(0, Math.round((z - 10) / 10)));
            glow += 110 * Math.exp(-(dx * dx + (z - lz) * (z - lz)) / 7);
            let dl = ((i + 0.5) / W) * Math.PI * 2 - mainLon;
            dl = Math.atan2(Math.sin(dl), Math.cos(dl));
            glow += 70 * Math.exp(-(dl * dl) / 0.012) * clamp01((dist - 6) / 40);
          } else if (spec.kind === "road") {
            const dx = Math.abs(x) - 5.4;
            const lz = -210 + 28 * Math.round((z + 210) / 28);
            glow += 120 * Math.exp(-(dx * dx + (z - lz) * (z - lz)) / 10);
          }
          r += glow;
          g += glow * 0.78;
          b += glow * 0.45;
        }
        const fog = 1 - Math.exp(-dist / 260);
        c = mix([r, g, b], horizon, fog);
      }
      const k = (j * W + i) * 4;
      img[k] = c[0];
      img[k + 1] = c[1];
      img[k + 2] = c[2];
      img[k + 3] = 255;
    }
  }
}
