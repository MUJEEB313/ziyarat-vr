import Link from "next/link";
import { collections, shrineShortName, shrines } from "@/content";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-surface">
      <div className="bg-girih pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:pb-14">
        <p className="arabic mb-10 text-center text-2xl text-gold-ink sm:text-3xl">اللّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّد</p>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{site.tagline}. Free and open to everyone, in your browser or VR headset.</p>
          </div>
          <FooterCol title="Shrines" links={shrines.map((s) => ({ href: `/shrines/${s.slug}`, label: shrineShortName(s) }))} />
          <FooterCol title="Collections" links={collections.map((c) => ({ href: `/collections/${c.slug}`, label: c.title }))} />
          <FooterCol
            title="Site"
            links={[
              { href: "/videos", label: "All videos" },
              { href: "/calendar", label: "Islamic calendar" },
              { href: "/how-to-watch", label: "How to watch in VR" },
              { href: "/saved", label: "Saved" },
              { href: "/about", label: "About & submit footage" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Made for the lovers of the Ahl al-Bayt (a.s.).</p>
          <p>Hijri dates follow the Umm al-Qura calendar and may differ locally by a day.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-gold-ink uppercase">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted transition hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
