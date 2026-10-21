"use client";

import Fuse from "fuse.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CATEGORIES, shrines, videos } from "@/content";
import type { Video } from "@/lib/types";
import { VideoGrid } from "./Cards";
import { Icon } from "./Icons";

const LENGTHS = [
  { id: "short", label: "Under 6 min", test: (s: number) => s < 360 },
  { id: "medium", label: "6–15 min", test: (s: number) => s >= 360 && s <= 900 },
  { id: "long", label: "Over 15 min", test: (s: number) => s > 900 },
];

const SORTS: { id: string; label: string; fn: (a: Video, b: Video) => number }[] = [
  { id: "popular", label: "Most watched", fn: (a, b) => b.views - a.views },
  { id: "newest", label: "Newest", fn: (a, b) => b.publishedAt.localeCompare(a.publishedAt) },
  { id: "longest", label: "Longest", fn: (a, b) => b.duration - a.duration },
  { id: "shortest", label: "Shortest", fn: (a, b) => a.duration - b.duration },
];

const fuse = new Fuse(videos, { keys: ["title", "summary", "description", "tags", "shrine"], threshold: 0.35, ignoreLocation: true });

export function LibraryBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const shrine = params.get("shrine") ?? "";
  const length = params.get("length") ?? "";
  const sort = params.get("sort") ?? "popular";

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    let list = q ? fuse.search(q).map((r) => r.item) : [...videos];
    if (category) list = list.filter((v) => v.category === category);
    if (shrine) list = list.filter((v) => v.shrine === shrine);
    const len = LENGTHS.find((l) => l.id === length);
    if (len) list = list.filter((v) => len.test(v.duration));
    if (!q) list.sort(SORTS.find((s) => s.id === sort)?.fn ?? SORTS[0].fn);
    return list;
  }, [q, category, shrine, length, sort]);

  const active = [category, shrine, length, q].filter(Boolean).length;

  const selects = (
    <>
      <Select label="Shrine" value={shrine} onChange={(v) => set("shrine", v)} options={shrines.map((s) => ({ value: s.slug, label: s.city }))} />
      <Select label="Length" value={length} onChange={(v) => set("length", v)} options={LENGTHS.map((l) => ({ value: l.id, label: l.label }))} />
      <Select label="Sort" value={sort === "popular" ? "" : sort} onChange={(v) => set("sort", v)} options={SORTS.slice(1).map((s) => ({ value: s.id, label: s.label }))} placeholder="Most watched" />
    </>
  );

  return (
    <div>
      <div className="-mx-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-xl sm:sticky sm:top-16 sm:z-30 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 sm:h-10 sm:max-w-xs">
              <Icon name="search" size={18} className="text-muted" />
              <span className="sr-only">Search videos</span>
              <input
                type="search"
                enterKeyHint="search"
                defaultValue={q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Search the library"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted sm:text-sm"
              />
            </label>
            <div className="hidden gap-2 sm:flex">{selects}</div>
          </div>
          {/* Phones: categories, then the selects, share one swipeable row instead of stacking. */}
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0">
            <Chip active={!category} onClick={() => set("category", "")}>
              All
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => set("category", category === c.id ? "" : c.id)}>
                {c.label}
              </Chip>
            ))}
            <span className="my-2 w-px shrink-0 bg-line sm:hidden" aria-hidden="true" />
            <div className="flex shrink-0 gap-2 sm:hidden">{selects}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-5 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>
          {results.length} {results.length === 1 ? "video" : "videos"}
        </span>
        {active > 0 && (
          <button onClick={() => router.replace(pathname, { scroll: false })} className="-my-3 h-11 text-gold-ink hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <VideoGrid videos={results} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong p-12 text-center">
          <p className="font-display text-2xl">No videos match these filters yet</p>
          <p className="mt-2 text-sm text-muted">Try a different shrine or category, or clear the filters.</p>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium transition sm:h-9 ${active ? "bg-fg text-bg" : "border border-line bg-surface text-muted hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 appearance-none rounded-full border bg-surface pr-9 pl-4 text-base outline-none transition sm:h-10 sm:text-sm ${value ? "border-gold/50 text-fg" : "border-line text-muted"}`}
      >
        <option value="">{placeholder ?? `Any ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronRight" size={14} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rotate-90 text-muted" />
    </label>
  );
}
