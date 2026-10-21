/** Seeded PRNG (mulberry32) so a scene always renders identically. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEG = Math.PI / 180;

/**
 * World direction for a longitude/latitude, matching three.js SphereGeometry
 * mapping after `scale(-1, 1, 1)` and `rotation.y = -π/2`:
 * lon 180° looks down −Z (forward), lon 270° looks to +X (right).
 */
export function direction(lonDeg: number, latDeg: number): [number, number, number] {
  const lon = lonDeg * DEG;
  const lat = latDeg * DEG;
  return [-Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat)];
}

/** World point → degree-space point (x = lon, y = −lat). */
export function project(x: number, y: number, z: number): [number, number] {
  const len = Math.hypot(x, y, z) || 1;
  let lon = Math.atan2(-x, z) / DEG;
  if (lon < 0) lon += 360;
  return [lon, -Math.asin(y / len) / DEG];
}

/** Tiny SVG path builder (degree-space coordinates). */
export class P {
  private parts: string[] = [];
  private static n(v: number) {
    return Number.isFinite(v) ? +v.toFixed(3) : 0;
  }
  M(x: number, y: number) {
    this.parts.push(`M${P.n(x)} ${P.n(y)}`);
    return this;
  }
  L(x: number, y: number) {
    this.parts.push(`L${P.n(x)} ${P.n(y)}`);
    return this;
  }
  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    this.parts.push(`C${P.n(x1)} ${P.n(y1)} ${P.n(x2)} ${P.n(y2)} ${P.n(x)} ${P.n(y)}`);
    return this;
  }
  Q(x1: number, y1: number, x: number, y: number) {
    this.parts.push(`Q${P.n(x1)} ${P.n(y1)} ${P.n(x)} ${P.n(y)}`);
    return this;
  }
  Z() {
    this.parts.push("Z");
    return this;
  }
  rect(x: number, y: number, w: number, h: number) {
    return this.M(x, y).L(x + w, y).L(x + w, y + h).L(x, y + h).Z();
  }
  /** Pointed (Persian) arch: base at y, springing at y - h*0.55, apex at y - h. */
  arch(cx: number, y: number, w: number, h: number) {
    const l = cx - w / 2;
    const r = cx + w / 2;
    const spring = y - h * 0.55;
    return this.M(l, y)
      .L(l, spring)
      .C(l, spring - h * 0.3, cx - w * 0.12, y - h * 0.9, cx, y - h)
      .C(cx + w * 0.12, y - h * 0.9, r, spring - h * 0.3, r, spring)
      .L(r, y)
      .Z();
  }
  /** Onion dome sitting on baseY, width w, height h. */
  dome(cx: number, baseY: number, w: number, h: number) {
    return this.M(cx - w / 2, baseY)
      .C(cx - w * 0.64, baseY - h * 0.38, cx - w * 0.4, baseY - h * 0.8, cx, baseY - h)
      .C(cx + w * 0.4, baseY - h * 0.8, cx + w * 0.64, baseY - h * 0.38, cx + w / 2, baseY)
      .Z();
  }
  /** Polygon of world-space points, edges subdivided so they curve correctly in equirect. */
  poly3(points: [number, number, number][], samples = 6) {
    let prevLon: number | null = null;
    let offset = 0;
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length];
      for (let s = 0; s < samples; s++) {
        const t = s / samples;
        const [rawLon, y] = project(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
        let lon = rawLon;
        if (prevLon !== null) {
          const d = lon + offset - prevLon;
          if (d > 180) offset -= 360;
          else if (d < -180) offset += 360;
        }
        lon += offset;
        prevLon = lon;
        if (i === 0 && s === 0) this.M(lon, y);
        else this.L(lon, y);
      }
    });
    return this.Z();
  }
  toString() {
    return this.parts.join("");
  }
}
