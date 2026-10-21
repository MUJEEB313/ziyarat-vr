import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { SavePill } from "@/components/SaveButtons";
import { ShareEmbed } from "@/components/ShareEmbed";
import { categoryLabel, getShrine, getVideo, relatedVideos, thumbOf, videos } from "@/content";
import { formatDate, formatDuration, formatLabel, formatViews } from "@/lib/format";
import { asset, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = getVideo((await params).slug);
  if (!video) return {};
  return {
    title: video.title,
    description: video.summary,
    alternates: { canonical: `/videos/${video.slug}` },
    openGraph: { title: video.title, description: video.summary, type: "video.other", images: [{ url: video.poster, width: 1280, height: 720 }] },
  };
}

export default async function WatchPage({ params }: Props) {
  const video = getVideo((await params).slug);
  if (!video) notFound();
  const shrine = getShrine(video.shrine);
  const related = relatedVideos(video, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [`${site.origin}${asset(video.poster)}`],
    uploadDate: video.publishedAt,
    duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`,
    embedUrl: `${site.url}/embed/${video.slug}`,
    ...(video.source.type === "file" ? { contentUrl: video.source.src.startsWith("http") ? video.source.src : `${site.origin}${asset(video.source.src)}` } : {}),
    interactionStatistic: { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: video.views },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-[1600px] px-0 sm:px-4">
        <div className="aspect-square max-h-[80vh] w-full sm:aspect-video overflow-hidden bg-black sm:rounded-3xl sm:ring-1 sm:ring-line">
          <VideoPlayer video={video} className="h-full w-full" />
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article>
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-x-1.5 text-xs text-muted [&_a]:inline-flex [&_a]:h-10 [&_a]:items-center sm:[&_a]:h-8">
            <Link href="/videos" className="hover:text-fg">
              Library
            </Link>
            <Icon name="chevronRight" size={12} />
            <Link href={`/videos?category=${video.category}`} className="hover:text-fg">
              {categoryLabel(video.category)}
            </Link>
            {shrine && (
              <>
                <Icon name="chevronRight" size={12} />
                <Link href={`/shrines/${shrine.slug}`} className="hover:text-fg">
                  {shrine.city}
                </Link>
              </>
            )}
          </nav>
          <h1 className="font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-ink">{formatLabel[video.format]}</span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={16} /> {formatDuration(video.duration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="eye" size={16} /> {formatViews(video.views)} views
            </span>
            <span>{formatDate(video.publishedAt)}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <SavePill slug={video.slug} list="favourites" />
            <SavePill slug={video.slug} list="watch-later" />
            <ShareEmbed slug={video.slug} title={video.title} />
          </div>

          <div className="mt-8 max-w-3xl space-y-4 leading-relaxed text-fg/90">
            <p className="text-lg">{video.summary}</p>
            <p className="text-muted">{video.description}</p>
          </div>

          {shrine && (
            <section className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex flex-col gap-6 p-6 sm:flex-row">
                <div className="flex-1">
                  <p className="arabic text-2xl text-gold-ink">{shrine.arabic}</p>
                  <h2 className="font-display mt-1 text-2xl font-semibold">{shrine.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {shrine.city}, {shrine.country}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-fg/85">{shrine.summary}</p>
                  <Link href={`/shrines/${shrine.slug}`} className="mt-2 inline-flex h-11 items-center gap-1.5 text-sm font-medium text-gold-ink hover:underline">
                    About the shrine <Icon name="arrowRight" size={16} />
                  </Link>
                </div>
                <div className="sm:w-60">
                  <h3 className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Recommended ziyarat</h3>
                  <ul className="space-y-1.5">
                    {shrine.ziyarat.map((z) => (
                      <li key={z} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" />
                        {z}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {video.tags.map((t) => (
              <Link key={t} href={`/videos?q=${encodeURIComponent(t)}`} className="flex h-10 items-center rounded-full border border-line px-3.5 text-xs text-muted transition hover:border-line-strong hover:text-fg">
                #{t}
              </Link>
            ))}
          </div>
          {video.credits && <p className="mt-6 text-xs text-muted">{video.credits}</p>}
        </article>

        <aside aria-label="Up next">
          <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Up next</h2>
          <ul className="space-y-4">
            {related.map((v) => (
              <li key={v.slug}>
                <Link href={`/videos/${v.slug}`} prefetch={false} className="group flex gap-3">
                  <span className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(thumbOf(v))} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1 text-[11px] text-white tabular-nums">{formatDuration(v.duration)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm leading-snug font-medium group-hover:text-gold-ink">{v.title}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {getShrine(v.shrine)?.city ?? categoryLabel(v.category)} · {formatViews(v.views)} views
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
