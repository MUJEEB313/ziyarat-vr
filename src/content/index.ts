import type { Category, Video } from "@/lib/types";
import { collections, occasions } from "./collections";
import { shrines } from "./shrines";
import { videos } from "./videos";

export { collections, occasions, shrines, videos };

export const CATEGORIES: { id: Category; label: string; description: string }[] = [
  { id: "ziyarat", label: "Virtual Ziyarat", description: "Stand inside the holy shrines" },
  { id: "arbaeen", label: "Arbaeen", description: "The walk to Karbala" },
  { id: "majlis", label: "Majalis", description: "Gatherings of remembrance" },
  { id: "history", label: "History", description: "Reconstructions of sacred history" },
  { id: "documentary", label: "Documentary", description: "Stories from the shrines" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c;

/** "Shrine of Imam Ali (a.s.)" → "Imam Ali (a.s.)" for compact labels. */
export const shrineShortName = (s: { name: string }) => s.name.replace(/^Shrine of /, "");

export const getVideo = (slug: string) => videos.find((v) => v.slug === slug);
export const getShrine = (slug?: string) => (slug ? shrines.find((s) => s.slug === slug) : undefined);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

export const videosForShrine = (slug: string) => videos.filter((v) => v.shrine === slug);

export const videosForCollection = (slug: string) =>
  (getCollection(slug)?.videos ?? []).map(getVideo).filter((v): v is Video => Boolean(v));

export const latestVideos = () => [...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const popularVideos = () => [...videos].sort((a, b) => b.views - a.views);

/** Related videos: same shrine first, then same category, then most popular. */
export function relatedVideos(video: Video, n = 8) {
  const score = (v: Video) => (v.shrine && v.shrine === video.shrine ? 2 : 0) + (v.category === video.category ? 1 : 0) + v.views / 1e7;
  return videos
    .filter((v) => v.slug !== video.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, n);
}
