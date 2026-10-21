import Link from "next/link";
import { categoryLabel, getShrine, shrineShortName, thumbOf, videosForCollection, videosForShrine } from "@/content";
import { formatDuration, formatLabel, formatViews } from "@/lib/format";
import { asset } from "@/lib/site";
import type { Collection, Shrine, Video } from "@/lib/types";
import { Icon } from "./Icons";
import { SaveIcon } from "./SaveButtons";

export function VideoCard({ video, size = "md", progress }: { video: Video; size?: "md" | "lg"; progress?: number }) {
  const shrine = getShrine(video.shrine);
  return (
    <div className="group relative">
    <Link href={`/videos/${video.slug}`} prefetch={false} className="block focus-visible:outline-none">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line transition group-hover:ring-gold/50 group-focus-visible:ring-2 group-focus-visible:ring-gold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(thumbOf(video))}
          decoding="async"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--gold-strong)] backdrop-blur">
          {formatLabel[video.format]}
        </span>
        <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/65 px-1.5 py-0.5 text-xs text-white tabular-nums">{formatDuration(video.duration)}</span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-black/40 ring-1 ring-white/40 backdrop-blur">
            <Icon name="play" size={24} className="text-white" />
          </span>
        </span>
        {progress !== undefined && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <span className="block h-full bg-gold" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className={`font-medium leading-snug text-balance transition group-hover:text-gold-ink ${size === "lg" ? "text-lg" : "text-[0.95rem]"}`}>{video.title}</h3>
        <p className="mt-1 text-xs text-muted">
          {shrine ? shrine.city : categoryLabel(video.category)} · {formatViews(video.views)} views
        </p>
      </div>
    </Link>
    <span className="absolute top-2 right-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
      <SaveIcon slug={video.slug} />
    </span>
    </div>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.slug} video={v} />
      ))}
    </div>
  );
}

/** Horizontally scrolling row (snap on touch, arrow buttons on desktop are unnecessary with wheel/trackpad). */
export function VideoRail({ videos }: { videos: Video[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
      {videos.map((v) => (
        <div key={v.slug} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[30%] xl:w-[23.5%]">
          <VideoCard video={v} />
        </div>
      ))}
    </div>
  );
}

export function ShrineCard({ shrine }: { shrine: Shrine }) {
  const vids = videosForShrine(shrine.slug);
  const cover = vids[0] && thumbOf(vids[0]);
  return (
    <Link href={`/shrines/${shrine.slug}`} prefetch={false} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line transition hover:ring-gold/50">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(cover)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="arabic text-lg text-[var(--gold-strong)]">{shrine.arabic}</p>
        <h3 className="font-display text-xl leading-tight font-semibold">{shrineShortName(shrine)}</h3>
        <p className="mt-1 text-xs text-white/75">
          {shrine.city}, {shrine.country}
        </p>
        <p className="mt-2 text-[11px] tracking-wide text-white/60 uppercase">
          {vids.length} {vids.length === 1 ? "video" : "videos"}
        </p>
      </div>
    </Link>
  );
}

const ACCENTS: Record<Collection["accent"], string> = {
  gold: "from-[#3b2a0c] via-[#7a5418] to-[#d6a645]",
  emerald: "from-[#06251a] via-[#0f5a3c] to-[#2fae74]",
  crimson: "from-[#1a0507] via-[#55121a] to-[#a5232f]",
  night: "from-[#050816] via-[#16224a] to-[#3a5aa8]",
};

export function CollectionCard({ collection }: { collection: Collection }) {
  const vids = videosForCollection(collection.slug);
  return (
    <Link href={`/collections/${collection.slug}`} prefetch={false} className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white ring-1 ring-line transition hover:ring-gold/50">
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENTS[collection.accent]}`} />
      <div className="absolute inset-y-0 right-0 flex w-3/5 translate-x-6 items-center gap-2 opacity-80 transition duration-500 group-hover:translate-x-2">
        {vids.slice(0, 3).map((v, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={v.slug}
            src={asset(thumbOf(v))}
            alt=""
            loading="lazy"
            className="aspect-[3/4] w-1/3 rounded-xl object-cover shadow-2xl ring-1 ring-white/20"
            style={{ transform: `translateY(${(i - 1) * 14}px) rotate(${(i - 1) * 4}deg)` }}
          />
        ))}
      </div>
      <div className="bg-girih absolute inset-0 opacity-[0.07]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="relative max-w-[60%]">
        {collection.arabic && <p className="arabic text-xl text-[var(--gold-strong)]">{collection.arabic}</p>}
        <h3 className="font-display text-2xl leading-tight font-semibold">{collection.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-white/75">{collection.summary}</p>
        <p className="mt-3 text-xs tracking-wide text-white/60 uppercase">{vids.length} videos</p>
      </div>
    </Link>
  );
}

export function SectionHeading({ title, eyebrow, href, linkLabel = "View all" }: { title: string; eyebrow?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="-my-2 flex h-11 shrink-0 items-center gap-1 text-sm text-muted transition hover:text-gold-ink">
          {linkLabel} <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}
