import type { MetadataRoute } from "next";
import { collections, shrines, videos } from "@/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/videos", "/shrines", "/collections", "/calendar", "/how-to-watch", "/about"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.7 : 1 })),
    ...videos.map((v) => ({ url: `${site.url}/videos/${v.slug}`, lastModified: v.publishedAt, priority: 0.8 })),
    ...shrines.map((s) => ({ url: `${site.url}/shrines/${s.slug}`, priority: 0.8 })),
    ...collections.map((c) => ({ url: `${site.url}/collections/${c.slug}`, priority: 0.6 })),
  ];
}
