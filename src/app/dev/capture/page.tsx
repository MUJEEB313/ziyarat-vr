"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getVideo } from "@/content";

/** Development-only: renders one scene full-window for `npm run posters` (/dev/capture?slug=…). */
function Capture() {
  const video = getVideo(useSearchParams().get("slug") ?? "");
  if (process.env.NODE_ENV === "production" || !video) return null;
  return (
    <div className="fixed inset-0">
      <VideoPlayer video={{ ...video, poster: "" }} mode="capture" className="h-full w-full" />
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense>
      <Capture />
    </Suspense>
  );
}
