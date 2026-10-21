"use client";

import { useList, type ListKey } from "@/lib/storage";
import { Icon } from "./Icons";

const CONFIG: Record<ListKey, { icon: "heart" | "clock"; on: string; off: string }> = {
  favourites: { icon: "heart", on: "Saved to favourites", off: "Add to favourites" },
  "watch-later": { icon: "clock", on: "In watch later", off: "Watch later" },
};

/** Compact icon toggle used on cards. */
export function SaveIcon({ slug, list = "favourites" }: { slug: string; list?: ListKey }) {
  const { has, toggle } = useList(list);
  const on = has(slug);
  const c = CONFIG[list];
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={on}
      aria-label={on ? c.on : c.off}
      title={on ? c.on : c.off}
      className={`grid size-11 place-items-center rounded-full bg-black/45 sm:size-9 backdrop-blur transition hover:bg-black/65 ${on ? "text-[var(--gold-strong)]" : "text-white"}`}
    >
      <Icon name={c.icon} size={18} fill={on && list === "favourites" ? "currentColor" : "none"} />
    </button>
  );
}

/** Labelled pill toggle used on the watch page. */
export function SavePill({ slug, list }: { slug: string; list: ListKey }) {
  const { has, toggle } = useList(list);
  const on = has(slug);
  const c = CONFIG[list];
  return (
    <button
      onClick={() => toggle(slug)}
      aria-pressed={on}
      className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${on ? "border-gold/50 bg-gold/15 text-gold-ink" : "border-line-strong hover:bg-surface-2"}`}
    >
      <Icon name={on ? "check" : c.icon} size={18} />
      {on ? c.on : c.off}
    </button>
  );
}
