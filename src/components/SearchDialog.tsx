"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { search, type SearchItem } from "@/lib/search";
import { asset } from "@/lib/site";
import { Icon } from "./Icons";

const TYPE_LABEL: Record<SearchItem["type"], string> = { video: "Video", shrine: "Shrine", collection: "Collection" };

export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-muted transition hover:border-line-strong hover:text-fg md:w-56 lg:w-64"
        aria-label="Search videos, shrines and collections"
      >
        <Icon name="search" size={18} />
        <span className="hidden md:inline">Search ziyarat, shrines…</span>
        <kbd className="ml-auto hidden rounded border border-line px-1.5 py-0.5 font-sans text-[11px] md:inline">⌘K</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q), [q]);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => setActive(0), [q]);

  const go = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && results[active]) go(results[active]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: Karbala, Arbaeen, Imam Rida, majlis…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          />
          <button onClick={onClose} className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">
            Esc
          </button>
        </div>
        <ul id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”.</li>}
          {results.map((r, i) => (
            <li key={r.href} id={`sr-${i}`} role="option" aria-selected={i === active}>
              <Link
                href={r.href}
                onClick={onClose}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-surface-2" : ""}`}
              >
                {r.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset(r.poster)} alt="" className="h-10 w-16 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="grid h-10 w-16 shrink-0 place-items-center rounded-md bg-surface-3 text-gold-ink">
                    <Icon name={r.type === "shrine" ? "map" : "eye"} size={18} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.title}</span>
                  <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                </span>
                <span className="text-[11px] tracking-wide text-muted uppercase">{TYPE_LABEL[r.type]}</span>
              </Link>
            </li>
          ))}
        </ul>
        {!q && <p className="border-t border-line px-4 py-2.5 text-xs text-muted">Type to search all 360° videos. Use ↑ ↓ and Enter to navigate.</p>}
      </div>
    </div>
  );
}
