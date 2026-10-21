import type { Occasion } from "./types";

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thaniya",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
];

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Hijri (Umm al-Qura) date for a Gregorian date, using the browser's Intl calendar. */
export function toHijri(date: Date): HijriDate {
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export const formatHijri = (h: HijriDate) => `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} AH`;

export interface UpcomingOccasion extends Occasion {
  date: Date;
  hijri: HijriDate;
  daysAway: number;
}

const DAY = 86400000;

/**
 * Upcoming occasions within `horizon` days, matched day-by-day against the
 * Hijri calendar. An occasion on the 30th falls back to the last day of a
 * 29-day month.
 */
export function upcomingOccasions(list: Occasion[], from = new Date(), horizon = 380): UpcomingOccasion[] {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const out: UpcomingOccasion[] = [];
  for (let i = 0; i <= horizon; i++) {
    const date = new Date(start + i * DAY);
    const h = toHijri(date);
    const next = toHijri(new Date(start + (i + 1) * DAY));
    const lastOfMonth = next.month !== h.month;
    for (const o of list) {
      const match = o.month === h.month && (o.day === h.day || (o.day === 30 && lastOfMonth && h.day === 29));
      if (match) out.push({ ...o, date, hijri: h, daysAway: i });
    }
  }
  return out;
}

/** Mourning season: Muharram and Safar (until 8 Rabi' al-Awwal). */
export const isMourningSeason = (h: HijriDate) => h.month === 1 || h.month === 2 || (h.month === 3 && h.day <= 8);
