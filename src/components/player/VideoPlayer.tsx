"use client";

import dynamic from "next/dynamic";
import { asset } from "@/lib/site";
import type { Video } from "@/lib/types";
import type { PlayerMode } from "./Vr360Player";

/** three.js is loaded only when a player is actually on screen. */
const Vr360Player = dynamic(() => import("./Vr360Player"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-[var(--surface-2)]" />,
});

export function VideoPlayer({
  video,
  mode = "full",
  autoPlay,
  className = "",
}: {
  video: Pick<Video, "slug" | "title" | "source" | "format" | "duration" | "poster">;
  mode?: PlayerMode;
  autoPlay?: boolean;
  className?: string;
}) {
  if (video.source.type === "youtube") {
    return (
      <div className={`relative bg-black ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.source.id}?rel=0&modestbranding=1${autoPlay ? "&autoplay=1&mute=1" : ""}`}
          title={video.title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <Vr360Player
      key={video.slug}
      slug={mode === "full" ? video.slug : undefined}
      source={video.source.type === "file" ? { ...video.source, src: asset(video.source.src) } : video.source}
      format={video.format}
      duration={video.duration}
      title={video.title}
      poster={video.poster && asset(video.poster)}
      mode={mode}
      autoPlay={autoPlay}
      className={className}
    />
  );
}
