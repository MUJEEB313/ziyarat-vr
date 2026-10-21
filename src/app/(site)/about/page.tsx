import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${site.name} exists, and how to contribute 360° footage of the shrines.`,
};

const PRINCIPLES = [
  { title: "Reverence first", body: "Every video is presented with the respect owed to the Ahl al-Bayt (a.s.) and their pilgrims. No faces of the Prophet (s.a.w.w.) or the Imams (a.s.) are ever depicted." },
  { title: "Everything in one place", body: "Shrine broadcasts, Arbaeen footage and majalis are scattered across many sites. We gather them into one library that is easy to browse and search." },
  { title: "Built for VR, not adapted to it", body: "Every page works on a phone, a computer and a headset, with no app and no account. The ziyarat should be open to everyone." },
  { title: "For those who cannot travel", body: "For the elderly and the sick, for those who cannot get a visa, and for children learning about the shrines for the first time." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">About</p>
      <h1 className="font-display mt-1 text-4xl leading-tight font-semibold sm:text-5xl">A doorway to the shrines, for everyone who longs to visit</h1>
      <p className="mt-5 text-lg leading-relaxed text-fg/85">
        Millions of believers long to stand before the shrines of the Ahl al-Bayt (a.s.) but cannot make the journey. {site.name} brings the courtyards
        of Karbala, Najaf, Kadhimiya, Samarra, Mashhad, Qom, Damascus and Madinah to any screen or headset, in full 360°.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <section key={p.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
          </section>
        ))}
      </div>

      <section id="submit" className="mt-14 rounded-3xl border border-gold/30 bg-gold/10 p-6 sm:p-10">
        <h2 className="font-display text-3xl font-semibold">Share your 360° footage</h2>
        <p className="mt-3 leading-relaxed text-fg/85">
          Have you filmed a ziyarat, the Arbaeen walk or a majlis with a 360° camera? Send it to us, with your name for the credits and permission from
          the shrine or organisers where needed. Equirectangular 360° video (mono or top/bottom stereo) and 180° side-by-side 3D are all supported, at 4K
          or higher.
        </p>
        <a href={`mailto:${site.contactEmail}?subject=360%C2%B0%20footage%20submission`} className="mt-6 inline-flex h-12 items-center rounded-full bg-gold px-6 font-semibold text-black transition hover:bg-gold-strong">
          Email {site.contactEmail}
        </a>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">About the current videos</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          While real footage is being gathered, the videos in the library are illustrated 360° scenes generated in your browser. They show how each
          ziyarat will look and play, including in VR. Each one is labelled “Placeholder scene” and will be replaced with real recordings.
        </p>
      </section>
    </div>
  );
}
