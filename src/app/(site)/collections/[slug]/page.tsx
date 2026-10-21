import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { collections, getCollection, getShrine, thumbOf, videosForCollection } from "@/content";
import { formatDuration } from "@/lib/format";
import { asset } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCollection((await params).slug);
  if (!c) return {};
  const cover = videosForCollection(c.slug)[0]?.poster;
  return { title: c.title, description: c.summary, openGraph: { images: cover ? [{ url: cover, width: 1280, height: 720 }] : undefined } };
}

export default async function CollectionPage({ params }: Props) {
  const c = getCollection((await params).slug);
  if (!c) notFound();
  const vids = videosForCollection(c.slug);
  const total = vids.reduce((s, v) => s + v.duration, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <Link href="/collections" className="-my-3 inline-flex h-11 items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon name="chevronLeft" size={16} /> All collections
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-end">
        <div>
          {c.arabic && <p className="arabic text-3xl text-gold-ink">{c.arabic}</p>}
          <h1 className="font-display mt-1 text-4xl leading-tight font-semibold sm:text-5xl">{c.title}</h1>
          <p className="mt-3 text-muted">{c.summary}</p>
          <p className="mt-3 text-sm text-muted">
            {vids.length} videos · {formatDuration(total)} total
          </p>
          {vids[0] && (
            <Link
              href={`/videos/${vids[0].slug}`}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-black transition hover:bg-gold-strong"
            >
              <Icon name="play" size={20} /> Play from the beginning
            </Link>
          )}
        </div>
        {vids[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(thumbOf(vids[0]))} alt="" className="aspect-video w-full rounded-2xl object-cover ring-1 ring-line" />
        )}
      </div>

      <ol className="mt-12 divide-y divide-line rounded-2xl border border-line bg-surface">
        {vids.map((v, i) => (
          <li key={v.slug}>
            <Link href={`/videos/${v.slug}`} prefetch={false} className="group flex items-center gap-4 p-4 transition hover:bg-surface-2 sm:gap-5">
              <span className="font-display w-6 text-center text-2xl text-gold-ink">{i + 1}</span>
              <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(thumbOf(v))} alt="" loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:text-gold-ink">{v.title}</span>
                <span className="mt-1 line-clamp-2 hidden text-sm text-muted sm:block">{v.summary}</span>
                <span className="mt-1 block text-xs text-muted">
                  {getShrine(v.shrine)?.city ?? "360°"} · {formatDuration(v.duration)}
                </span>
              </span>
              <Icon name="play" size={20} className="hidden shrink-0 text-muted group-hover:text-gold-ink sm:block" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
