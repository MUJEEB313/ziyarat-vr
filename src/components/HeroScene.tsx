"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/site";
import type { Video } from "@/lib/types";
import { VideoPlayer } from "./player/VideoPlayer";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * The hero's poster paints immediately (it is the largest image on the page);
 * the live 360° scene, which pulls in three.js, starts only once the page is idle.
 * On data-saver or 2G connections the still image is kept.
 */
export function HeroScene({ video }: { video: Video }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const start = () => setLive(true);
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    let id = 0;
    const schedule = () => (id = idle(start, { timeout: 2500 }));
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      cancel(id);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(video.poster)} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      {live && <VideoPlayer video={video} mode="ambient" className="h-full w-full" />}
    </div>
  );
}
