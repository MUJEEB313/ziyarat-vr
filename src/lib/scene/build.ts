import { P, project, rng } from "./geometry";
import { domePaint, lit, LAMP, SKIES, WARM_GLOW, type SkyPalette } from "./palette";
import type {
  CourtyardSpec,
  HallSpec,
  Paint,
  PlainSpec,
  RoadSpec,
  SceneSpec,
  Shape,
  ShrineOpts,
} from "./types";

/** Eye height above the ground in metres (world origin is the viewer's eye). */
export const EYE = 1.6;
export const HALL_EYE = 1.2;

type Rand = () => number;

export function skyFor(spec: SceneSpec): SkyPalette {
  return spec.kind === "hall" ? SKIES.night : SKIES[spec.sky];
}

/** Build the vector layer of a scene, ordered back-to-front. */
export function buildScene(spec: SceneSpec): Shape[] {
  const pal = skyFor(spec);
  const R = rng(spec.seed);
  switch (spec.kind) {
    case "courtyard":
      return [...skyShapes(pal, R), ...courtyard(spec, pal, R)];
    case "road":
      return [...skyShapes(pal, R), ...road(spec, pal, R)];
    case "plain":
      return [...skyShapes(pal, R), ...plain(spec, pal, R)];
    case "hall":
      return hall(spec, R);
  }
}

/* ------------------------------------------------------------------ sky */

function skyShapes(pal: SkyPalette, R: Rand): Shape[] {
  const out: Shape[] = [];
  for (let i = 0; i < pal.stars; i++) {
    // Uniform on the sphere: latitude via asin so the poles aren't crowded.
    const lat = Math.asin(0.03 + R() * 0.97) * (180 / Math.PI);
    const bright = R();
    out.push({
      kind: "circle",
      x: R() * 360,
      y: -lat,
      r: 0.04 + bright * bright * 0.1,
      fill: `rgba(255,${235 + Math.round(R() * 20)},${210 + Math.round(R() * 45)},${(0.35 + bright * 0.65).toFixed(2)})`,
    });
  }
  if (pal.moon) {
    out.push({ kind: "circle", x: 228, y: -38, r: 1.6, fill: "#fbf3da", glow: { color: "rgba(250,240,210,0.8)", blur: 3 } });
  }
  for (let i = 0; i < pal.clouds; i++) {
    const x = R() * 360;
    const y = -(6 + R() * 22);
    const w = 10 + R() * 22;
    const p = new P();
    for (let k = 0; k < 5; k++) {
      const cx = x + (k - 2) * w * 0.18 + (R() - 0.5) * 2;
      const r = w * (0.12 + R() * 0.1);
      ellipse(p, cx, y + (R() - 0.5) * 1.5, r, r * 0.45);
    }
    out.push({ kind: "path", d: p.toString(), fill: pal.lit ? "rgba(255,170,140,0.28)" : "rgba(255,255,255,0.55)", glow: { color: "rgba(255,255,255,0.4)", blur: 2.5 } });
  }
  return out;
}

function ellipse(p: P, cx: number, cy: number, rx: number, ry: number) {
  const k = 0.5523;
  return p
    .M(cx - rx, cy)
    .C(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry)
    .C(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy)
    .C(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry)
    .C(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy)
    .Z();
}

/* ------------------------------------------------------------ courtyard */

const FACADE = {
  tile: { wall: "#2b6c8c", recess: "#143a50", trim: "#d9b45c", band: "#38a7b3" },
  stone: { wall: "#d6c3a0", recess: "#7f6a49", trim: "#c9a24f", band: "#8c7350" },
};

function recessPaint(style: keyof typeof FACADE, pal: SkyPalette): { fill: Paint; glow?: Shape["glow"] } {
  return pal.lit
    ? { fill: { y0: -6, y1: 2, stops: [[0, "#ffd58a"], [1, "#d98b2e"]] }, glow: WARM_GLOW }
    : { fill: lit(FACADE[style].recess, pal) };
}

function courtyard(spec: CourtyardSpec, pal: SkyPalette, R: Rand): Shape[] {
  const out: Shape[] = [];
  const main = spec.shrines[0]?.lon ?? 180;
  out.push(...arcadeRing(spec, pal, main));
  for (const d of spec.sideDomes ?? []) out.push(...sideMosque(d.lon, d.scale ?? 0.8, pal));
  for (const s of spec.shrines) out.push(...shrine(s, pal));
  out.push(...courtyardProps(pal, R));
  return out;
}

function arcadeRing(spec: CourtyardSpec, pal: SkyPalette, mainLon: number): Shape[] {
  const f = FACADE[spec.arcade];
  const out: Shape[] = [];
  const wall = new P().rect(0, -8.2, 360, 9.6);
  out.push({ kind: "path", d: wall.toString(), fill: lit(f.wall, pal) });
  out.push({ kind: "path", d: new P().rect(0, -8.9, 360, 0.7).toString(), fill: lit(f.trim, pal, 1.1) });
  out.push({ kind: "path", d: new P().rect(0, -8.2, 360, 0.5).toString(), fill: lit(f.band, pal) });

  const arches = new P();
  const gates = [90, 180, 270].map((o) => (mainLon + o) % 360);
  const nearGate = (x: number) => gates.some((g) => Math.abs(((x - g + 540) % 360) - 180) < 5);
  for (let x = 2; x < 360; x += 4) {
    if (nearGate(x)) continue;
    arches.arch(x, 1.3, 2.6, 4.5);
    arches.arch(x, -3.8, 2.3, 3.4);
  }
  out.push({ kind: "path", d: arches.toString(), ...recessPaint(spec.arcade, pal), stroke: lit(f.trim, pal), lineWidth: 0.1 });

  for (const g of gates) {
    out.push({ kind: "path", d: new P().rect(g - 4.2, -12.5, 8.4, 13.8).toString(), fill: lit(f.wall, pal, 1.05) });
    out.push({ kind: "path", d: new P().rect(g - 4.2, -13.1, 8.4, 0.6).toString(), fill: lit(f.trim, pal, 1.1) });
    out.push({ kind: "path", d: new P().arch(g, 1.3, 5.4, 11.6).toString(), fill: domePaint("gold", -11, 1, pal) });
    out.push({ kind: "path", d: new P().arch(g, 1.3, 4.2, 10.2).toString(), ...recessPaint(spec.arcade, pal) });
  }

  if (spec.clockTowerLon !== undefined) {
    const c = spec.clockTowerLon;
    out.push({ kind: "path", d: new P().rect(c - 2.4, -24, 4.8, 11.5).toString(), fill: lit(f.wall, pal, 1.05) });
    out.push({ kind: "circle", x: c, y: -18.6, r: 1.7, fill: domePaint("gold", -20.5, -16.7, pal) });
    out.push({ kind: "circle", x: c, y: -18.6, r: 1.35, fill: "#f6f0de", glow: pal.lit ? { color: "rgba(255,240,200,0.9)", blur: 1.5 } : undefined });
    out.push({ kind: "path", d: new P().M(c, -18.6).L(c, -19.6).M(c, -18.6).L(c + 0.7, -18.3).toString(), stroke: "#2a2015", lineWidth: 0.16 });
    out.push({ kind: "path", d: new P().dome(c, -24, 5, 5.5).toString(), fill: domePaint("gold", -29.5, -24, pal) });
    out.push({ kind: "path", d: new P().rect(c - 0.08, -31.5, 0.16, 2.2).toString(), fill: domePaint("gold", -31.5, -29, pal) });
  }
  return out;
}

function minaret(x: number, base: number, height: number, w: number, color: ShrineOpts["minaretColor"], pal: SkyPalette): Shape[] {
  const top = base - height;
  const paint: Paint =
    color === "gold"
      ? domePaint("gold", top, base, pal)
      : color === "tile"
        ? { y0: top, y1: base, stops: [[0, lit("#3fb0bf", pal)], [1, lit("#1d5f7a", pal)]] }
        : { y0: top, y1: base, stops: [[0, lit("#efe4cf", pal)], [1, lit("#bba57e", pal)]] };
  const balcony = base - height * 0.7;
  const p = new P()
    .M(x - w / 2, base)
    .L(x - w * 0.42, balcony)
    .L(x + w * 0.42, balcony)
    .L(x + w / 2, base)
    .Z()
    .rect(x - w * 0.36, base - height * 0.9, w * 0.72, height * 0.2)
    .dome(x, base - height * 0.9, w * 0.9, height * 0.07)
    .rect(x - 0.05, top, 0.1, height * 0.04);
  const out: Shape[] = [{ kind: "path", d: p.toString(), fill: paint }];
  out.push({
    kind: "path",
    d: new P().rect(x - w * 0.8, balcony - w * 0.5, w * 1.6, w * 0.5).rect(x - w * 0.6, base - height * 0.83, w * 1.2, w * 0.35).toString(),
    fill: pal.lit ? LAMP : domePaint("gold", balcony - w, balcony, pal),
    glow: pal.lit ? WARM_GLOW : undefined,
  });
  return out;
}

function shrine(o: ShrineOpts, pal: SkyPalette): Shape[] {
  const s = o.scale ?? 1;
  const x = o.lon;
  const G = 1.2; // ground line
  const f = FACADE[o.facade];
  const out: Shape[] = [];
  const roof = -14 * s;

  out.push({ kind: "path", d: new P().rect(x - 17 * s, roof, 34 * s, G - roof).toString(), fill: lit(f.wall, pal, 1.08) });
  out.push({ kind: "path", d: new P().rect(x - 17 * s, roof - 0.8 * s, 34 * s, 0.8 * s).toString(), fill: lit(f.trim, pal, 1.1) });
  out.push({ kind: "path", d: new P().rect(x - 17 * s, roof, 34 * s, 0.9 * s).toString(), fill: lit(f.band, pal) });
  const small = new P();
  for (let dx = -15; dx <= 15; dx += 3) {
    if (Math.abs(dx) < 7) continue;
    small.arch(x + dx * s, G, 1.9 * s, 5.4 * s);
    small.arch(x + dx * s, -6.3 * s, 1.7 * s, 4.6 * s);
  }
  out.push({ kind: "path", d: small.toString(), ...recessPaint(o.facade, pal), stroke: lit(f.trim, pal), lineWidth: 0.08 });

  const domes = o.twin
    ? [
        { cx: x - 6.8 * s, w: 9.6 * s, h: 11 * s },
        { cx: x + 6.8 * s, w: 9.6 * s, h: 11 * s },
      ]
    : [{ cx: x, w: 12.8 * s, h: 14.5 * s }];
  const drumTop = roof - 4.6 * s;
  for (const d of domes) {
    out.push({ kind: "path", d: new P().rect(d.cx - d.w * 0.43, drumTop, d.w * 0.86, roof - drumTop + 0.1).toString(), fill: o.dome === "gold" ? lit("#3a7f97", pal, 1.05) : lit(f.wall, pal) });
    const win = new P();
    for (let k = -2; k <= 2; k++) win.arch(d.cx + k * d.w * 0.16, roof - 0.7 * s, d.w * 0.07, 2.6 * s);
    out.push({ kind: "path", d: win.toString(), ...recessPaint("tile", pal) });
    out.push({ kind: "path", d: new P().dome(d.cx, drumTop, d.w, d.h).toString(), fill: domePaint(o.dome, drumTop - d.h, drumTop, pal), glow: pal.lit ? { color: "rgba(255,200,90,0.55)", blur: 2.2 } : undefined });
    out.push({ kind: "path", d: new P().dome(d.cx - d.w * 0.16, drumTop - 0.1, d.w * 0.28, d.h * 0.9).toString(), fill: "rgba(255,255,255,0.16)" });
    const apex = drumTop - d.h;
    out.push({ kind: "path", d: new P().rect(d.cx - 0.1 * s, apex - 3.4 * s, 0.2 * s, 3.5 * s).toString(), fill: domePaint("gold", apex - 3.4 * s, apex, pal) });
    out.push({ kind: "circle", x: d.cx, y: apex - 2 * s, r: 0.45 * s, fill: domePaint("gold", apex - 2.5 * s, apex - 1.5 * s, pal) });
  }

  if (o.goldenIwan) {
    const top = roof - 2.4 * s;
    out.push({ kind: "path", d: new P().rect(x - 5.6 * s, top, 11.2 * s, G - top).toString(), fill: domePaint("gold", top, G, pal), glow: pal.lit ? WARM_GLOW : undefined });
    out.push({ kind: "path", d: new P().arch(x, G, 7.4 * s, 13.4 * s).toString(), fill: pal.lit ? { y0: -13 * s, y1: G, stops: [[0, "#ffe2a0"], [1, "#b8741f"]] } : lit("#5a3d12", pal) });
    out.push({ kind: "path", d: new P().arch(x, G, 5 * s, 10.5 * s).toString(), fill: pal.lit ? "#fff0c6" : lit("#2e2210", pal), glow: pal.lit ? WARM_GLOW : undefined });
  }

  const pairs = [
    { dx: 13.5, h: 40 },
    { dx: 20.5, h: 33 },
  ].slice(0, o.minaretPairs);
  for (const m of pairs) {
    for (const side of [-1, 1]) out.push(...minaret(x + side * m.dx * s, G, m.h * s, 1.8 * s, o.minaretColor, pal));
  }
  return out;
}

function sideMosque(x: number, s: number, pal: SkyPalette): Shape[] {
  const out: Shape[] = [];
  const top = -12 * s;
  out.push({ kind: "path", d: new P().rect(x - 10 * s, top, 20 * s, 1.2 - top).toString(), fill: lit(FACADE.tile.wall, pal) });
  out.push({ kind: "path", d: new P().rect(x - 4.6 * s, top - 4 * s, 9.2 * s, 4.2 * s).toString(), fill: lit("#2f8aa0", pal) });
  out.push({ kind: "path", d: new P().dome(x, top - 4 * s, 10.5 * s, 12 * s).toString(), fill: domePaint("turquoise", top - 16 * s, top - 4 * s, pal) });
  out.push({ kind: "path", d: new P().arch(x, 1.2, 8 * s, 15 * s).toString(), fill: lit("#1c5a78", pal) });
  out.push({ kind: "path", d: new P().arch(x, 1.2, 5.6 * s, 11.5 * s).toString(), ...recessPaint("tile", pal) });
  for (const side of [-1, 1]) out.push(...minaret(x + side * 6.4 * s, 1.2, 34 * s, 1.7 * s, "tile", pal));
  return out;
}

/** A standing (or seated) silhouette billboard at world (x, z). */
function person(x: number, z: number, h: number, color: string, ground: number, seated = false): Shape {
  const [lon, yTop] = project(x, ground + h, z);
  const [, yBot] = project(x, ground, z);
  const H = yBot - yTop;
  const w = H * (seated ? 0.62 : 0.3);
  const head = H * (seated ? 0.17 : 0.1);
  const p = new P();
  const shoulder = yTop + head * 2.1;
  p.M(lon - w * 0.32, shoulder)
    .C(lon - w * 0.48, shoulder + H * 0.25, lon - w * 0.55, yBot - H * 0.2, lon - w * 0.5, yBot)
    .L(lon + w * 0.5, yBot)
    .C(lon + w * 0.55, yBot - H * 0.2, lon + w * 0.48, shoulder + H * 0.25, lon + w * 0.32, shoulder)
    .Q(lon, shoulder - head * 0.6, lon - w * 0.32, shoulder)
    .Z();
  ellipse(p, lon, yTop + head, head * 0.85, head);
  return { kind: "path", d: p.toString(), fill: color };
}

function crowdColor(R: Rand, pal: SkyPalette) {
  const r = R();
  if (r < 0.62) return lit("#151318", pal, 1.4);
  if (r < 0.82) return lit("#e9e4da", pal, 0.9);
  if (r < 0.92) return lit("#3d4a3f", pal);
  return lit("#5a3a2a", pal);
}

function lampPost(x: number, z: number, h: number, pal: SkyPalette, ground: number): Shape[] {
  const w = 0.07;
  const pole = new P().poly3([
    [x - w, ground, z],
    [x + w, ground, z],
    [x + w, ground + h, z],
    [x - w, ground + h, z],
  ], 2);
  const [lon, y] = project(x, ground + h + 0.25, z);
  const dist = Math.hypot(x, z);
  const r = Math.atan2(0.2, dist) * (180 / Math.PI);
  return [
    { kind: "path", d: pole.toString(), fill: lit("#3a3226", pal, 1.3) },
    { kind: "circle", x: lon, y, r, fill: pal.lit ? "#fff1c8" : lit("#e8dcc0", pal), glow: pal.lit ? { color: "rgba(255,210,130,0.95)", blur: r * 4 + 0.6 } : undefined },
  ];
}

function courtyardProps(pal: SkyPalette, R: Rand): Shape[] {
  const ground = -EYE;
  const items: { d: number; shapes: Shape[] }[] = [];
  for (const side of [-1, 1]) {
    for (let z = -8; z >= -44; z -= 9) items.push({ d: Math.hypot(6, z), shapes: lampPost(side * 6.5, z, 4.2, pal, ground) });
    for (let z = 10; z <= 40; z += 10) items.push({ d: Math.hypot(6, z), shapes: lampPost(side * 6.5, z, 4.2, pal, ground) });
  }
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2;
    const r = 5 + R() * 42;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const seated = R() < 0.35;
    items.push({ d: r, shapes: [person(x, z, seated ? 0.95 : 1.55 + R() * 0.2, crowdColor(R, pal), ground, seated)] });
  }
  items.sort((a, b) => b.d - a.d);
  return items.flatMap((i) => i.shapes);
}

/* ----------------------------------------------------------------- road */

const FLAG_COLORS = ["#0d0d0f", "#1d7a46", "#a3192a", "#0d0d0f", "#1d7a46"];
const TENT_COLORS = ["#f2efe6", "#1d7a46", "#16161a", "#a3192a", "#f2efe6", "#2a5b8a"];

function palm(x: number, z: number, h: number, pal: SkyPalette, ground: number, R: Rand): Shape[] {
  const [lon, yTop] = project(x, ground + h, z);
  const [, yBot] = project(x, ground, z);
  const H = yBot - yTop;
  const lean = (R() - 0.5) * H * 0.15;
  const trunk = new P().M(lon - H * 0.025, yBot).Q(lon + lean * 0.5, yTop + H * 0.5, lon + lean, yTop).L(lon + lean + H * 0.02, yTop).Q(lon + lean * 0.5 + H * 0.04, yTop + H * 0.5, lon + H * 0.025, yBot).Z();
  const fronds = new P();
  const cx = lon + lean;
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + R() * 0.3;
    const len = H * (0.32 + R() * 0.12);
    const ex = cx + Math.cos(a) * len;
    const ey = yTop + Math.abs(Math.sin(a)) * len * 0.45 + len * 0.18;
    fronds.M(cx, yTop).Q(cx + Math.cos(a) * len * 0.5, yTop - len * 0.22, ex, ey).Q(cx + Math.cos(a) * len * 0.45, yTop - len * 0.08, cx, yTop + H * 0.02).Z();
  }
  return [
    { kind: "path", d: trunk.toString(), fill: lit("#5b4630", pal, 0.9) },
    { kind: "path", d: fronds.toString(), fill: lit("#2f5a2c", pal, 0.95) },
  ];
}

function tent(x: number, z: number, side: number, color: string, pal: SkyPalette, ground: number): Shape[] {
  const len = 8;
  const h = 3.2;
  const peak = 4.3;
  const fx = x; // face toward road
  const bx = x + side * 4;
  const front: [number, number, number][] = [
    [fx, ground, z - len / 2],
    [fx, ground, z + len / 2],
    [fx, ground + h, z + len / 2],
    [fx, ground + h, z - len / 2],
  ];
  const roof: [number, number, number][] = [
    [fx, ground + h, z - len / 2],
    [fx, ground + h, z + len / 2],
    [(fx + bx) / 2, ground + peak, z + len / 2],
    [(fx + bx) / 2, ground + peak, z - len / 2],
  ];
  const opening: [number, number, number][] = [
    [fx, ground, z - len * 0.35],
    [fx, ground, z + len * 0.35],
    [fx, ground + h * 0.85, z + len * 0.35],
    [fx, ground + h * 0.85, z - len * 0.35],
  ];
  return [
    { kind: "path", d: new P().poly3(roof).toString(), fill: lit(color, pal, 0.85) },
    { kind: "path", d: new P().poly3(front).toString(), fill: lit(color, pal) },
    {
      kind: "path",
      d: new P().poly3(opening).toString(),
      fill: pal.lit ? "#ffcf86" : lit("#3b2f22", pal),
      glow: pal.lit ? WARM_GLOW : undefined,
    },
  ];
}

function flag(x: number, z: number, color: string, pal: SkyPalette, ground: number): Shape[] {
  const top = ground + 5.2;
  const w = 0.06;
  return [
    { kind: "path", d: new P().poly3([[x - w, ground, z], [x + w, ground, z], [x + w, top, z], [x - w, top, z]], 2).toString(), fill: lit("#6b6150", pal) },
    { kind: "path", d: new P().poly3([[x, top, z], [x, top, z - 1.5], [x, top - 1, z - 1.6], [x, top - 1, z]], 4).toString(), fill: lit(color, pal, 1.1) },
  ];
}

function road(spec: RoadSpec, pal: SkyPalette, R: Rand): Shape[] {
  const ground = -EYE;
  const items: { d: number; shapes: Shape[] }[] = [];
  // The golden dome of Karbala on the far horizon, straight ahead.
  const horizon = shrine({ lon: 180, scale: 0.16, dome: "gold", minaretPairs: 1, minaretColor: "gold", facade: "tile", goldenIwan: true }, pal);
  items.push({ d: 10000, shapes: horizon });
  for (let i = 0; i < 80; i++) {
    const side = R() < 0.5 ? -1 : 1;
    const x = side * (22 + R() * 90);
    const z = (R() - 0.5) * 600;
    items.push({ d: Math.hypot(x, z), shapes: palm(x, z, 8 + R() * 6, pal, ground, R) });
  }
  let t = 0;
  for (let z = -230; z <= 90; z += 15) {
    for (const side of [-1, 1]) {
      const x = side * (7.5 + R() * 1.5);
      items.push({ d: Math.hypot(x, z), shapes: tent(x, z, side, TENT_COLORS[t++ % TENT_COLORS.length], pal, ground) });
    }
  }
  let f = 0;
  for (let z = -200; z <= 80; z += 9) {
    if (Math.abs(z) < 10) continue;
    for (const side of [-1, 1]) items.push({ d: Math.hypot(4.7, z), shapes: flag(side * 4.7, z, FLAG_COLORS[f++ % FLAG_COLORS.length], pal, ground) });
  }
  if (pal.lit) {
    for (let z = -210; z <= 90; z += 28) {
      for (const side of [-1, 1]) items.push({ d: Math.hypot(5.4, z), shapes: lampPost(side * 5.4, z, 6.5, pal, ground) });
    }
  }
  for (let i = 0; i < spec.crowd; i++) {
    const ahead = R() < 0.78;
    const z = ahead ? -(2.5 + Math.pow(R(), 1.6) * 230) : 3 + R() * 70;
    const x = (R() - 0.5) * 6.4;
    items.push({ d: Math.hypot(x, z), shapes: [person(x, z, 1.5 + R() * 0.3, crowdColor(R, pal), ground)] });
  }
  items.sort((a, b) => b.d - a.d);
  return items.flatMap((i) => i.shapes);
}

/* ---------------------------------------------------------------- plain */

function bedouinTent(x: number, z: number, pal: SkyPalette, ground: number, R: Rand): Shape[] {
  const w = 5 + R() * 3;
  const d = 3.5;
  const h = 2.4;
  const a = R() * Math.PI;
  const ux = Math.cos(a) * w * 0.5;
  const uz = Math.sin(a) * w * 0.5;
  const vx = -Math.sin(a) * d * 0.5;
  const vz = Math.cos(a) * d * 0.5;
  const body: [number, number, number][] = [
    [x - ux - vx, ground, z - uz - vz],
    [x + ux - vx, ground, z + uz - vz],
    [x + ux * 0.8, ground + h, z + uz * 0.8],
    [x - ux * 0.8, ground + h, z - uz * 0.8],
  ];
  const body2: [number, number, number][] = [
    [x - ux + vx, ground, z - uz + vz],
    [x + ux + vx, ground, z + uz + vz],
    [x + ux * 0.8, ground + h, z + uz * 0.8],
    [x - ux * 0.8, ground + h, z - uz * 0.8],
  ];
  return [
    { kind: "path", d: new P().poly3(body2, 4).toString(), fill: lit("#3a2c22", pal) },
    { kind: "path", d: new P().poly3(body, 4).toString(), fill: lit("#5a4434", pal) },
  ];
}

function plain(spec: PlainSpec, pal: SkyPalette, R: Rand): Shape[] {
  const ground = -EYE;
  const items: { d: number; shapes: Shape[] }[] = [];
  if (spec.distantMosqueLon !== undefined) {
    const x = spec.distantMosqueLon;
    const s = 0.35;
    const skyline = new P();
    for (let dx = -30; dx < 30; dx += 2.5 + R() * 2) skyline.rect(x + dx, -(1 + R() * 3), 2.4, 4.5);
    items.push({ d: 5000, shapes: [{ kind: "path", d: skyline.toString(), fill: lit("#cdbb98", pal, 0.95) }] });
    const mosque: Shape[] = [
      { kind: "path", d: new P().rect(x - 14 * s, -10 * s, 28 * s, 10 * s + 1).toString(), fill: lit("#e7dcc6", pal) },
      { kind: "path", d: new P().rect(x - 3 * s, -13 * s, 6 * s, 3.2 * s).toString(), fill: lit("#2f8a5c", pal) },
      { kind: "path", d: new P().dome(x, -13 * s, 7 * s, 8 * s).toString(), fill: domePaint("green", -21 * s, -13 * s, pal) },
    ];
    for (const dx of [-17, -9, 9, 17]) mosque.push(...minaret(x + dx * s, 1, 34 * s, 1.5 * s, "stone", pal));
    items.push({ d: 4000, shapes: mosque });
  }
  for (let i = 0; i < (spec.river ? 70 : 20); i++) {
    const x = (R() - 0.5) * 300;
    const z = spec.river ? -(85 + R() * 120) : (R() < 0.5 ? -1 : 1) * (80 + R() * 200);
    items.push({ d: Math.hypot(x, z), shapes: palm(x, z, 8 + R() * 6, pal, ground, R) });
  }
  if (spec.wall) {
    const p = new P().rect(0, -1.6, 360, 3.2);
    const gate = new P().arch(180, 1.6, 2.4, 3.2);
    items.push({
      d: 60,
      shapes: [
        { kind: "path", d: p.toString(), fill: lit("#d8c8a8", pal) },
        { kind: "path", d: new P().rect(0, -1.8, 360, 0.25).toString(), fill: lit("#b8a67f", pal) },
        { kind: "path", d: gate.toString(), fill: lit("#5a4a32", pal) },
      ],
    });
  }
  for (let i = 0; i < (spec.tents ?? 0); i++) {
    const a = (145 + R() * 70) * (Math.PI / 180);
    const r = 16 + R() * 38;
    const x = -Math.sin(a) * r;
    const z = Math.cos(a) * r;
    items.push({ d: r, shapes: bedouinTent(x, z, pal, ground, R) });
  }
  for (let i = 0; i < (spec.graves ?? 0); i++) {
    const a = R() * Math.PI * 2;
    const r = 3 + Math.pow(R(), 0.7) * 50;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const mound: [number, number, number][] = [
      [x - 0.45, ground, z],
      [x + 0.45, ground, z],
      [x + 0.3, ground + 0.22, z],
      [x - 0.3, ground + 0.22, z],
    ];
    const stone: [number, number, number][] = [
      [x - 0.08, ground, z - 0.6],
      [x + 0.08, ground, z - 0.6],
      [x + 0.08, ground + 0.45, z - 0.6],
      [x - 0.08, ground + 0.45, z - 0.6],
    ];
    items.push({
      d: r,
      shapes: [
        { kind: "path", d: new P().poly3(mound, 2).toString(), fill: lit("#b9a37e", pal, 0.9) },
        { kind: "path", d: new P().poly3(stone, 2).toString(), fill: lit("#8d8170", pal) },
      ],
    });
  }
  if (spec.graves) {
    for (let i = 0; i < 14; i++) {
      const a = R() * Math.PI * 2;
      const r = 8 + R() * 40;
      items.push({ d: r, shapes: [person(Math.sin(a) * r, Math.cos(a) * r, 1.6 + R() * 0.15, crowdColor(R, pal), ground)] });
    }
  }
  items.sort((a, b) => b.d - a.d);
  return items.flatMap((i) => i.shapes);
}

/* ----------------------------------------------------------------- hall */

/** Hall box half-extents (x, z) and height, shared with the ground painter. */
export const HALL = { hx: 10, hz: 7, height: 5.2 };

function hall(spec: HallSpec, R: Rand): Shape[] {
  const ground = -HALL_EYE;
  const out: Shape[] = [];
  // Chandeliers hang from the ceiling.
  for (const cx of [-5, 0, 5]) {
    for (const cz of [-3.5, 3.5]) {
      const [lon, y] = project(cx, HALL.height - HALL_EYE - 0.9, cz);
      const d = Math.hypot(cx, cz, 3);
      const r = Math.atan2(0.28, d) * (180 / Math.PI);
      out.push({ kind: "circle", x: lon, y, r, fill: "#fff3d0", glow: { color: "rgba(255,220,150,1)", blur: r * 3 } });
      out.push({ kind: "circle", x: lon, y, r: r * 1.8, fill: "rgba(255,215,140,0.18)" });
    }
  }
  const walls: { lon: number; dist: number }[] = [
    { lon: 180, dist: HALL.hz },
    { lon: 270, dist: HALL.hx },
    { lon: 0, dist: HALL.hz },
    { lon: 90, dist: HALL.hx },
  ];
  walls.forEach((w, i) => {
    const y = -Math.atan2(2.95 - HALL_EYE, w.dist) * (180 / Math.PI);
    const size = Math.atan2(0.8, w.dist) * (180 / Math.PI);
    out.push({ kind: "text", x: w.lon, y, text: spec.banners[i], size, fill: "#f1d27a", glow: { color: "rgba(241,210,122,0.6)", blur: size * 0.12 } });
  });
  // Minbar against the front wall.
  const mz = -HALL.hz + 0.05;
  const steps: [number, number, number][] = [
    [-0.7, ground, mz + 1.6],
    [0.7, ground, mz + 1.6],
    [0.7, ground + 1.8, mz + 0.3],
    [-0.7, ground + 1.8, mz + 0.3],
  ];
  out.push({ kind: "path", d: new P().poly3(steps, 4).toString(), fill: "#4a2c16" });
  out.push({ kind: "path", d: new P().poly3([[-0.75, ground + 1.8, mz + 0.3], [0.75, ground + 1.8, mz + 0.3], [0.75, ground + 2.3, mz + 0.2], [-0.75, ground + 2.3, mz + 0.2]], 4).toString(), fill: "#6a3e1c", stroke: "#d4a849", lineWidth: 0.12 });
  // Mourners seated in rows facing the minbar.
  const people: { d: number; s: Shape }[] = [];
  for (let row = 0; row < 7; row++) {
    const z = -2.3 - row * 0.75;
    for (let x = -8.5; x <= 8.5; x += 0.75) {
      if (R() < 0.18) continue;
      const px = x + (R() - 0.5) * 0.25;
      if (Math.abs(px) < 0.5 && row < 1) continue;
      people.push({ d: Math.hypot(px, z), s: person(px, z, 0.95 + R() * 0.12, R() < 0.85 ? "#0f0e12" : "#2b2a30", ground, true) });
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = (R() - 0.5) * 18;
    const z = 1.6 + R() * 5;
    people.push({ d: Math.hypot(x, z), s: person(x, z, 0.95, "#121116", ground, true) });
  }
  people.sort((a, b) => b.d - a.d);
  out.push(...people.map((p) => p.s));
  return out;
}
