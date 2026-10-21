"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * Per-viewer library state (favourites, watch later, progress) kept in
 * localStorage. Every access is guarded: storage can be unavailable in
 * private windows or embedded contexts, and the site must still work.
 */

const EVENT = "zvr-storage";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    /* corrupted entry: use fallback */
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

const EMPTY: string[] = [];
const EMPTY_PROGRESS: Record<string, Progress> = {};

export type ListKey = "favourites" | "watch-later";

export function useList(list: ListKey) {
  const key = `zvr:${list}`;
  const items = useStored<string[]>(key, EMPTY);
  const toggle = useCallback(
    (slug: string) => {
      const cur = read<string[]>(key, EMPTY);
      write(key, cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur]);
    },
    [key],
  );
  return { items, has: (slug: string) => items.includes(slug), toggle };
}

export interface Progress {
  /** Seconds watched. */
  t: number;
  /** Total duration. */
  d: number;
  /** Last watched (epoch ms). */
  at: number;
}

const PROGRESS = "zvr:progress";

export function useProgress() {
  return useStored<Record<string, Progress>>(PROGRESS, EMPTY_PROGRESS);
}

export function saveProgress(slug: string, t: number, d: number) {
  const cur = read<Record<string, Progress>>(PROGRESS, EMPTY_PROGRESS);
  const next = { ...cur };
  // Finished (or barely started) videos drop out of "Continue watching".
  if (t < 5 || t > d - 5) delete next[slug];
  else next[slug] = { t, d, at: Date.now() };
  write(PROGRESS, next);
}

export function getProgress(slug: string): Progress | undefined {
  if (typeof window === "undefined") return undefined;
  return read<Record<string, Progress>>(PROGRESS, EMPTY_PROGRESS)[slug];
}
