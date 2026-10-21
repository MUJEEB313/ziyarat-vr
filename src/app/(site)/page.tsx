import Link from "next/link";
import { CollectionCard, SectionHeading, ShrineCard, VideoRail } from "@/components/Cards";
import { ContinueWatching } from "@/components/ContinueWatching";
import { Hero } from "@/components/Hero";
import { Icon, type IconName } from "@/components/Icons";
import { OccasionBanner } from "@/components/OccasionBanner";
import { collections, getVideo, latestVideos, popularVideos, shrines, videos } from "@/content";

const DEVICES: { icon: IconName; title: string; body: string }[] = [
  { icon: "phone", title: "Phone", body: "Turn on motion control and move your phone to look around the shrine." },
  { icon: "headset", title: "VR headset", body: "Open the site in Meta Quest or Vision Pro and tap “Enter VR” for full immersion." },
  { icon: "monitor", title: "Computer", body: "Drag with the mouse or use the arrow keys. Scroll to zoom in on the tilework." },
];

export default function HomePage() {
  const hero = getVideo("night-at-the-haram-of-imam-husayn") ?? videos[0];
  return (
    <>
      <Hero video={hero} />

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <OccasionBanner />
      </div>

      <ContinueWatching />

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Curated journeys" title="Collections" href="/collections" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 3).map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Virtual ziyarat" title="Visit the holy shrines" href="/shrines" linkLabel="All shrines" />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {shrines.map((s) => (
            <div key={s.slug} className="w-[62%] shrink-0 snap-start sm:w-[34%] md:w-[26%] lg:w-[19%]">
              <ShrineCard shrine={s} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Just added" title="New in 360°" href="/videos?sort=newest" />
        <VideoRail videos={latestVideos().slice(0, 8)} />
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Most visited" title="Most watched" href="/videos?sort=popular" />
        <VideoRail videos={popularVideos().slice(0, 8)} />
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10">
          <div className="bg-girih pointer-events-none absolute inset-0 opacity-[0.05]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Any device, no app</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Three ways to step inside</h2>
              <p className="mt-3 text-muted">Every video plays in the browser you already have. In a headset, the shrine surrounds you, and the trigger plays and pauses.</p>
              <Link href="/how-to-watch" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-ink hover:underline">
                Read the viewing guide <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {DEVICES.map((d) => (
                <div key={d.title} className="rounded-2xl border border-line bg-bg/60 p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-gold/15 text-gold-ink">
                    <Icon name={d.icon} size={22} />
                  </span>
                  <h3 className="mt-4 font-medium">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl px-4 text-center sm:px-6">
        <p className="arabic text-3xl leading-[1.9] text-gold-ink sm:text-4xl">قُل لَّا أَسْأَلُكُمْ عَلَيْهِ أَجْرًا إِلَّا الْمَوَدَّةَ فِي الْقُرْبَىٰ</p>
        <p className="font-display mt-4 text-xl text-fg/90 italic sm:text-2xl">“Say: I ask of you no reward for it except love for my near kin.”</p>
        <p className="mt-2 text-sm text-muted">Holy Qur&apos;an, Surat al-Shura 42:23</p>
      </section>
    </>
  );
}
