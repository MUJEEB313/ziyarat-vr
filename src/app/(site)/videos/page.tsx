import type { Metadata } from "next";
import { Suspense } from "react";
import { VideoGrid } from "@/components/Cards";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { popularVideos } from "@/content";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse every 360° and VR video: virtual ziyarat, Arbaeen, majalis and history.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">The library</p>
      <h1 className="font-display mt-1 text-4xl font-semibold sm:text-5xl">All 360° videos</h1>
      <p className="mt-3 max-w-2xl text-muted">Every shrine, every season, in one place. Filter by shrine, category or length, and save videos to watch later.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="mt-24"><VideoGrid videos={popularVideos()} /></div>}>
          <LibraryBrowser />
        </Suspense>
      </div>
    </div>
  );
}
