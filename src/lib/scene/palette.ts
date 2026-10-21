import type { DomeColor, Paint, Sky } from "./types";

export interface SkyPalette {
  top: string;
  mid: string;
  horizon: string;
  /** Overall ambient light multiplier for surfaces. */
  light: number;
  /** RGB tint applied to lit surfaces. */
  tint: [number, number, number];
  stars: number;
  moon: boolean;
  clouds: number;
  /** Artificial lights (windows, lamps) glow at night/dusk. */
  lit: boolean;
}

export const SKIES: Record<Sky, SkyPalette> = {
  night: {
    top: "#02040c",
    mid: "#0a1330",
    horizon: "#26345e",
    light: 0.45,
    tint: [0.95, 0.85, 0.7],
    stars: 900,
    moon: true,
    clouds: 0,
    lit: true,
  },
  dusk: {
    top: "#11163b",
    mid: "#5a3570",
    horizon: "#f2915a",
    light: 0.72,
    tint: [1, 0.82, 0.68],
    stars: 160,
    moon: false,
    clouds: 6,
    lit: true,
  },
  dawn: {
    top: "#1d3263",
    mid: "#8c86b8",
    horizon: "#f7cfa6",
    light: 0.86,
    tint: [1, 0.93, 0.86],
    stars: 40,
    moon: false,
    clouds: 8,
    lit: false,
  },
  day: {
    top: "#1c5aa3",
    mid: "#5c9fd8",
    horizon: "#d9ebf7",
    light: 1,
    tint: [1, 1, 1],
    stars: 0,
    moon: false,
    clouds: 14,
    lit: false,
  },
};

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Apply the sky's light level and tint to a base colour. */
export function lit(hex: string, pal: SkyPalette, extra = 1): string {
  const [r, g, b] = hexToRgb(hex);
  const k = pal.light * extra;
  const c = (v: number, t: number) => Math.max(0, Math.min(255, Math.round(v * k * t)));
  return `rgb(${c(r, pal.tint[0])},${c(g, pal.tint[1])},${c(b, pal.tint[2])})`;
}

const DOME_STOPS: Record<DomeColor, [number, string][]> = {
  gold: [
    [0, "#fff6d2"],
    [0.3, "#f1c75c"],
    [0.72, "#c58e2c"],
    [1, "#7d5310"],
  ],
  turquoise: [
    [0, "#bff1f0"],
    [0.35, "#35b2bf"],
    [1, "#0d5566"],
  ],
  green: [
    [0, "#b9ecc9"],
    [0.35, "#2f9d66"],
    [1, "#11533a"],
  ],
};

/** Domes are floodlit at night, so they stay bright regardless of sky. */
export function domePaint(color: DomeColor, y0: number, y1: number, pal: SkyPalette): Paint {
  const boost = pal.lit ? 1 : Math.max(0.85, pal.light);
  return {
    y0,
    y1,
    stops: DOME_STOPS[color].map(([o, c]) => [o, boost === 1 ? c : lit(c, { ...pal, light: boost, tint: [1, 1, 1] })]),
  };
}

export const WARM_GLOW = { color: "rgba(255,196,110,0.9)", blur: 1.2 };
export const LAMP = "#ffd890";
