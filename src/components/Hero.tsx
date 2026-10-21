import Link from "next/link";
import { getShrine } from "@/content";
import type { Video } from "@/lib/types";
import { Icon } from "./Icons";
import { VideoPlayer } from "./player/VideoPlayer";

/** Full-width hero with a live, slowly turning 360° scene behind the copy. */
export function Hero({ video }: { video: Video }) {
  const shrine = getShrine(video.shrine);
  return (
    <section className="relative mx-auto max-w-[1600px] px-2 sm:px-4">
      <div className="relative h-[78svh] min-h-[520px] overflow-hidden rounded-[28px] ring-1 ring-line">
        <div className="absolute inset-0">
          <VideoPlayer video={video} mode="ambient" className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-14">
          <p className="arabic mb-3 text-2xl text-[var(--gold-strong)] drop-shadow sm:text-3xl">السَّلامُ عَلَيْكَ يا أبا عَبْدِ الله</p>
          <h1 className="font-display max-w-3xl text-4xl leading-[1.05] font-semibold text-balance drop-shadow-lg sm:text-6xl lg:text-7xl">
            Stand before the Haram, from anywhere in the world.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            360° and VR ziyarat of the holy shrines, the Arbaeen walk and the majalis of Muharram. Watch in your browser, move your phone to look around, or step inside with a headset.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/videos/${video.slug}`}
              className="flex h-12 items-center gap-2 rounded-full bg-[var(--gold)] px-6 font-semibold text-black shadow-lg shadow-black/30 transition hover:bg-[var(--gold-strong)]"
            >
              <Icon name="play" size={20} /> Begin virtual ziyarat
            </Link>
            <Link href="/shrines" className="flex h-12 items-center gap-2 rounded-full bg-white/10 px-6 font-medium ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20">
              Explore the shrines
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-white/60">
            <Icon name="drag" size={14} /> Drag the scene to look around · Now showing: {shrine?.name ?? video.title}
          </p>
        </div>
      </div>
    </section>
  );
}
