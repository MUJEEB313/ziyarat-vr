/**
 * Procedural 360° scene description.
 *
 * Placeholder videos are rendered in the browser from a SceneSpec instead of
 * shipping footage. Replace a video's `source` with a real file to retire it.
 */

export type Sky = "night" | "dusk" | "dawn" | "day";

export type Particles = "lights" | "pigeons" | "motes" | "dust";

export type DomeColor = "gold" | "turquoise" | "green";
export type FacadeStyle = "tile" | "stone";

export interface ShrineOpts {
  /** Longitude (degrees) of the shrine centre. 180 = straight ahead. */
  lon: number;
  /** Angular scale; 1 ≈ standing ~80 m away. */
  scale?: number;
  dome: DomeColor;
  /** Two side-by-side domes (e.g. Kadhimiya). */
  twin?: boolean;
  /** Pairs of minarets: 0, 1 or 2. */
  minaretPairs: 0 | 1 | 2;
  minaretColor: "gold" | "tile" | "stone";
  facade: FacadeStyle;
  /** Golden iwan (portal) framing the entrance. */
  goldenIwan?: boolean;
}

export interface CourtyardSpec {
  kind: "courtyard";
  sky: Sky;
  seed: number;
  shrines: ShrineOpts[];
  /** Additional turquoise mosque domes (e.g. Goharshad in Mashhad). */
  sideDomes?: { lon: number; scale?: number }[];
  arcade: FacadeStyle;
  /** Clock tower above a gate in the arcade (Najaf). */
  clockTowerLon?: number;
  inlay: string;
  particles: Particles[];
}

export interface RoadSpec {
  kind: "road";
  sky: Sky;
  seed: number;
  /** Number of walking pilgrims drawn along the road. */
  crowd: number;
  particles: Particles[];
}

export interface HallSpec {
  kind: "hall";
  seed: number;
  /** Arabic banner texts, one per wall: front, right, back, left. */
  banners: [string, string, string, string];
  particles: Particles[];
}

export interface PlainSpec {
  kind: "plain";
  sky: Sky;
  seed: number;
  river?: boolean;
  tents?: number;
  wall?: boolean;
  graves?: number;
  /** Distant green dome of al-Masjid an-Nabawi. */
  distantMosqueLon?: number;
  particles: Particles[];
}

export type SceneSpec = CourtyardSpec | RoadSpec | HallSpec | PlainSpec;

/** A vertical gradient in degree space, or a flat CSS colour. */
export type Paint = string | { y0: number; y1: number; stops: [number, string][] };

export interface Glow {
  color: string;
  /** Blur radius in degrees. */
  blur: number;
}

/**
 * Drawing primitives in "degree space": x = longitude (0–360),
 * y = −latitude (so negative y is above the horizon).
 */
export type Shape =
  | { kind: "path"; d: string; fill?: Paint; stroke?: string; lineWidth?: number; glow?: Glow; alpha?: number }
  | { kind: "circle"; x: number; y: number; r: number; fill: Paint; glow?: Glow; alpha?: number }
  | { kind: "text"; x: number; y: number; text: string; size: number; fill: string; glow?: Glow };
