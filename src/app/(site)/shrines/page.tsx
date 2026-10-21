import type { Metadata } from "next";
import { ShrineCard } from "@/components/Cards";
import { shrines } from "@/content";

export const metadata: Metadata = {
  title: "The Holy Shrines",
  description: "Virtual ziyarat of the shrines of the Ahl al-Bayt (a.s.) in Iraq, Iran, Syria and Madinah.",
};

const REGIONS = [
  { title: "Iraq: the Atabat", countries: ["Iraq"] },
  { title: "Iran, Syria & the Hijaz", countries: ["Iran", "Syria", "Saudi Arabia"] },
];

export default function ShrinesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Virtual ziyarat</p>
      <h1 className="font-display mt-1 text-4xl font-semibold sm:text-5xl">The holy shrines</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Choose a shrine to learn its story, find its recommended ziyarat, and stand in its courtyard in 360°.
      </p>
      {REGIONS.map((r) => (
        <section key={r.title} className="mt-12">
          <h2 className="font-display mb-5 text-2xl font-semibold">{r.title}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {shrines
              .filter((s) => r.countries.includes(s.country))
              .map((s) => (
                <ShrineCard key={s.slug} shrine={s} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
