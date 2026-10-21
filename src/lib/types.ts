import type { SceneSpec } from "./scene/types";

export type Category = "ziyarat" | "arbaeen" | "majlis" | "history" | "documentary";

export type VideoFormat = "360-mono" | "360-stereo-tb" | "180-stereo-sbs";

export type VideoSource =
  /** A real equirectangular video file (mp4/webm/HLS-compatible URL). */
  | { type: "file"; src: string }
  /** A YouTube 360° video, embedded with YouTube's own player. */
  | { type: "youtube"; id: string }
  /** Placeholder: a procedurally generated 360° scene rendered in the browser. */
  | { type: "generated"; scene: SceneSpec };

export interface Video {
  slug: string;
  title: string;
  /** Short line for cards. */
  summary: string;
  description: string;
  category: Category;
  shrine?: string;
  format: VideoFormat;
  source: VideoSource;
  /** Poster image path (16:9). */
  poster: string;
  /** Duration in seconds. */
  duration: number;
  publishedAt: string;
  views: number;
  tags: string[];
  credits?: string;
  featured?: boolean;
}

export interface Shrine {
  slug: string;
  name: string;
  arabic: string;
  /** Who is buried there, with honorifics. */
  resting: string;
  city: string;
  country: string;
  coords: [number, number];
  summary: string;
  about: string[];
  ziyarat: string[];
}

export interface Collection {
  slug: string;
  title: string;
  arabic?: string;
  summary: string;
  videos: string[];
  accent: "gold" | "emerald" | "crimson" | "night";
}

export interface Occasion {
  /** Hijri month 1–12. */
  month: number;
  day: number;
  title: string;
  kind: "wiladat" | "shahadat" | "eid" | "commemoration";
  /** Where the banner should take people. */
  href: string;
}
