"use client";

import Link from "next/link";
import { useState } from "react";
import { videos } from "@/content";
import { useList, useProgress } from "@/lib/storage";
import type { Video } from "@/lib/types";
import { VideoCard } from "./Cards";

const TABS = [
  { id: "favourites", label: "Favourites" },
  { id: "watch-later", label: "Watch later" },
  { id: "continue", label: "Continue watching" },
] as const;

const bySlug = (slugs: string[]) => slugs.map((s) => videos.find((v) => v.slug === s)).filter((v): v is Video => Boolean(v));

export function SavedLibrary() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("favourites");
  const favourites = useList("favourites");
  const later = useList("watch-later");
  const progress = useProgress();
  const continuing = Object.entries(progress).sort((a, b) => b[1].at - a[1].at);

  const counts = { favourites: favourites.items.length, "watch-later": later.items.length, continue: continuing.length };
  const list =
    tab === "favourites" ? bySlug(favourites.items) : tab === "watch-later" ? bySlug(later.items) : bySlug(continuing.map(([s]) => s));

  return (
    <>
      <div role="tablist" aria-label="Saved lists" className="mt-8 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${tab === t.id ? "bg-fg text-bg" : "border border-line bg-surface text-muted hover:text-fg"}`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${tab === t.id ? "bg-bg/20" : "bg-surface-2"}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8">
        {list.length ? (
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((v) => {
              const p = progress[v.slug];
              return <VideoCard key={v.slug} video={v} progress={tab === "continue" && p ? p.t / p.d : undefined} />;
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong p-12 text-center">
            <p className="font-display text-2xl">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted">
              {tab === "continue"
                ? "Videos you start watching will appear here so you can pick up where you left off."
                : "Tap the heart or clock on any video to keep it here."}
            </p>
            <Link href="/videos" className="mt-5 inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-semibold text-black">
              Browse the library
            </Link>
          </div>
        )}
      </div>
      <p className="mt-10 text-xs text-muted">Your saved lists are stored on this device only. No account needed.</p>
    </>
  );
}
