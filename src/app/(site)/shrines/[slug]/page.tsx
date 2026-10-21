import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading, ShrineCard, VideoGrid } from "@/components/Cards";
import { Icon } from "@/components/Icons";
import { getShrine, shrines, videosForShrine } from "@/content";
import { asset } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return shrines.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shrine = getShrine((await params).slug);
  if (!shrine) return {};
  const cover = videosForShrine(shrine.slug)[0]?.poster;
  return {
    title: `${shrine.name}, ${shrine.city}`,
    description: shrine.summary,
    openGraph: { images: cover ? [{ url: cover, width: 1280, height: 720 }] : undefined },
  };
}

export default async function ShrinePage({ params }: Props) {
  const shrine = getShrine((await params).slug);
  if (!shrine) notFound();
  const vids = videosForShrine(shrine.slug);
  const cover = vids[0]?.poster;
  const [lat, lon] = shrine.coords;
  const others = shrines.filter((s) => s.slug !== shrine.slug).slice(0, 5);

  return (
    <>
      <section className="relative mx-auto max-w-[1600px] px-2 sm:px-4">
        <div className="relative flex min-h-[420px] items-end overflow-hidden rounded-[28px] ring-1 ring-line sm:min-h-[520px]">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(cover)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="relative p-6 text-white sm:p-10 lg:p-14">
            <p className="arabic text-3xl text-[var(--gold-strong)] sm:text-4xl">{shrine.arabic}</p>
            <h1 className="font-display mt-2 max-w-3xl text-4xl leading-tight font-semibold sm:text-6xl">{shrine.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-white/75">
              <Icon name="map" size={18} /> {shrine.city}, {shrine.country}
            </p>
            {vids[0] && (
              <Link
                href={`/videos/${vids[0].slug}`}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--gold)] px-6 font-semibold text-black transition hover:bg-[var(--gold-strong)]"
              >
                <Icon name="play" size={20} /> Begin ziyarat in 360°
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-12 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold">About the shrine</h2>
          <p className="mt-2 text-sm text-gold-ink">Resting here: {shrine.resting}</p>
          <div className="mt-5 space-y-4 leading-relaxed text-fg/85">
            {shrine.about.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </article>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Recommended ziyarat</h3>
            <ul className="space-y-2">
              {shrine.ziyarat.map((z) => (
                <li key={z} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" />
                  {z}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 transition hover:border-line-strong"
          >
            <span>
              <span className="block text-xs font-semibold tracking-[0.18em] text-muted uppercase">Location</span>
              <span className="mt-1 block text-sm">
                {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
              </span>
            </span>
            <span className="flex items-center gap-1 text-sm text-gold-ink">
              Open map <Icon name="arrowRight" size={16} />
            </span>
          </a>
        </aside>
      </div>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="In 360°" title={`Videos from ${shrine.city}`} />
        {vids.length ? <VideoGrid videos={vids} /> : <p className="text-muted">Videos from this shrine are coming soon, in sha Allah.</p>}
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Continue your ziyarat" title="Other shrines" href="/shrines" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {others.map((s) => (
            <ShrineCard key={s.slug} shrine={s} />
          ))}
        </div>
      </section>
    </>
  );
}
