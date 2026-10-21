import Fuse from "fuse.js";
import { categoryLabel, collections, shrines, videos } from "@/content";

export interface SearchItem {
  type: "video" | "shrine" | "collection";
  href: string;
  title: string;
  subtitle: string;
  keywords: string;
  poster?: string;
}

const items: SearchItem[] = [
  ...videos.map((v) => ({
    type: "video" as const,
    href: `/videos/${v.slug}`,
    title: v.title,
    subtitle: `${categoryLabel(v.category)} · ${shrines.find((s) => s.slug === v.shrine)?.city ?? "360° video"}`,
    keywords: [v.summary, v.tags.join(" "), v.shrine ?? ""].join(" "),
    poster: v.poster,
  })),
  ...shrines.map((s) => ({
    type: "shrine" as const,
    href: `/shrines/${s.slug}`,
    title: s.name,
    subtitle: `${s.city}, ${s.country}`,
    keywords: [s.resting, s.arabic, s.city, s.summary].join(" "),
  })),
  ...collections.map((c) => ({
    type: "collection" as const,
    href: `/collections/${c.slug}`,
    title: c.title,
    subtitle: "Collection",
    keywords: [c.summary, c.arabic ?? ""].join(" "),
  })),
];

const fuse = new Fuse(items, {
  keys: [
    { name: "title", weight: 3 },
    { name: "subtitle", weight: 1 },
    { name: "keywords", weight: 1.5 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
});

export function search(query: string, limit = 12): SearchItem[] {
  const q = query.trim();
  if (!q) return items.filter((i) => i.type !== "video").slice(0, limit);
  return fuse.search(q, { limit }).map((r) => r.item);
}
