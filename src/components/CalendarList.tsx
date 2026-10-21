"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { occasions } from "@/content";
import { formatHijri, HIJRI_MONTHS, toHijri, upcomingOccasions, type HijriDate, type UpcomingOccasion } from "@/lib/hijri";
import { Icon } from "./Icons";

const KIND: Record<UpcomingOccasion["kind"], { label: string; dot: string }> = {
  shahadat: { label: "Martyrdom", dot: "bg-crimson" },
  wiladat: { label: "Birth", dot: "bg-emerald" },
  eid: { label: "Eid", dot: "bg-gold" },
  commemoration: { label: "Commemoration", dot: "bg-muted" },
};

export function CalendarList() {
  const [data, setData] = useState<{ today: HijriDate; list: UpcomingOccasion[] } | null>(null);

  useEffect(() => {
    const now = new Date();
    setData({ today: toHijri(now), list: upcomingOccasions(occasions, now, 365) });
  }, []);

  if (!data) {
    return (
      <div className="mt-10 space-y-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    );
  }

  // Group by Hijri month, in order of occurrence.
  const groups: { key: string; title: string; items: UpcomingOccasion[] }[] = [];
  for (const o of data.list) {
    const key = `${o.hijri.year}-${o.hijri.month}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, title: `${HIJRI_MONTHS[o.hijri.month - 1]} ${o.hijri.year}`, items: [] };
      groups.push(g);
    }
    g.items.push(o);
  }

  return (
    <>
      <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm">
        <Icon name="calendar" size={18} className="text-gold-ink" /> Today is <strong className="font-semibold">{formatHijri(data.today)}</strong>
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
        {Object.values(KIND).map((k) => (
          <span key={k.label} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${k.dot}`} /> {k.label}
          </span>
        ))}
      </div>
      {groups.map((g) => (
        <section key={g.key} className="mt-10">
          <h2 className="font-display mb-4 text-2xl font-semibold">{g.title}</h2>
          <ul className="space-y-3">
            {g.items.map((o) => (
              <li key={`${o.title}-${o.date.toISOString()}`}>
                <Link href={o.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong">
                  <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-surface-2 py-2 text-center">
                    <span className="font-display text-2xl leading-none font-semibold">{o.hijri.day}</span>
                    <span className="mt-0.5 text-[10px] tracking-wide text-muted uppercase">{HIJRI_MONTHS[o.hijri.month - 1].split(" ")[0]}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-xs text-muted">
                      <span className={`size-2 rounded-full ${KIND[o.kind].dot}`} />
                      {KIND[o.kind].label} ·{" "}
                      {o.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                    </span>
                    <span className="mt-1 block font-medium group-hover:text-gold-ink">{o.title}</span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-muted sm:block">
                    {o.daysAway === 0 ? "Today" : o.daysAway === 1 ? "Tomorrow" : `in ${o.daysAway} days`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
