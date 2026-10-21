"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { occasions } from "@/content";
import { formatHijri, isMourningSeason, toHijri, upcomingOccasions, type HijriDate, type UpcomingOccasion } from "@/lib/hijri";
import { Icon } from "./Icons";

const KIND_STYLE: Record<UpcomingOccasion["kind"], string> = {
  shahadat: "from-[#2a0a0e] to-[#5a1520] ring-crimson/40",
  commemoration: "from-[#0b0b10] to-[#2a2a36] ring-white/15",
  wiladat: "from-[#0b2a1d] to-[#14563a] ring-emerald/40",
  eid: "from-[#2d2208] to-[#6a4c14] ring-gold/40",
};

/**
 * Shows today's Hijri date and the nearest occasion. Computed on the client so
 * it is always correct for the viewer's day (static pages would freeze it).
 * `?hijri-test=YYYY-MM-DD` overrides today's date for testing.
 */
export function OccasionBanner() {
  const [state, setState] = useState<{ today: HijriDate; next?: UpcomingOccasion } | null>(null);

  useEffect(() => {
    const test = new URLSearchParams(window.location.search).get("hijri-test");
    const now = test ? new Date(`${test}T12:00:00`) : new Date();
    const today = toHijri(now);
    setState({ today, next: upcomingOccasions(occasions, now, 60)[0] });
  }, []);

  if (!state) return <div className="h-[76px] rounded-2xl bg-surface" aria-hidden="true" />;
  const { today, next } = state;
  const mourning = isMourningSeason(today);
  const style = next ? KIND_STYLE[next.kind] : mourning ? KIND_STYLE.shahadat : KIND_STYLE.commemoration;
  const when = !next ? "" : next.daysAway === 0 ? "Today" : next.daysAway === 1 ? "Tomorrow" : `In ${next.daysAway} days`;

  return (
    <section aria-label="Islamic calendar" className={`relative overflow-hidden rounded-2xl bg-gradient-to-r p-4 text-white ring-1 sm:p-5 ${style}`}>
      <div className="bg-girih pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
            <Icon name="calendar" />
          </span>
          <div>
            <p className="text-xs tracking-[0.18em] text-white/60 uppercase">Today · {formatHijri(today)}</p>
            {next ? (
              <p className="font-medium">
                <span className="text-[var(--gold-strong)]">{when}:</span> {next.title}
              </p>
            ) : (
              <p className="font-medium">{mourning ? "The season of mourning for Imam Husayn (a.s.)" : "Visit the shrines of the Ahl al-Bayt (a.s.) today"}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {next && (
            <Link href={next.href} className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25">
              Watch related <Icon name="arrowRight" size={16} />
            </Link>
          )}
          <Link href="/calendar" className="flex items-center rounded-full px-3 py-2 text-sm text-white/75 transition hover:text-white">
            Full calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
