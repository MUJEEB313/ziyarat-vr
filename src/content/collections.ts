import type { Collection, Occasion } from "@/lib/types";

export const collections: Collection[] = [
  {
    slug: "holy-shrines-of-iraq",
    title: "The Holy Shrines of Iraq",
    arabic: "العتبات المقدسة",
    summary: "Karbala, Najaf, Kadhimiya and Samarra. A virtual ziyarat of the Atabat.",
    videos: [
      "night-at-the-haram-of-imam-husayn",
      "shrine-of-abbas-at-dawn",
      "bayn-al-haramayn-at-dusk",
      "haram-of-imam-ali-najaf",
      "golden-domes-of-kadhimiya",
      "samarra-the-restored-dome",
    ],
    accent: "gold",
  },
  {
    slug: "arbaeen",
    title: "Arbaeen: Walk to Karbala",
    arabic: "زيارة الأربعين",
    summary: "The world's largest annual pilgrimage, from the road to the shrine.",
    videos: ["arbaeen-walk-najaf-to-karbala", "arbaeen-mawakib-at-night", "bayn-al-haramayn-at-dusk", "night-at-the-haram-of-imam-husayn"],
    accent: "emerald",
  },
  {
    slug: "muharram",
    title: "Muharram & Ashura",
    arabic: "محرم الحرام",
    summary: "Majalis, the land of Karbala, and the shrines of its martyrs.",
    videos: ["majlis-on-the-night-of-ashura", "plains-of-karbala-61-ah", "night-at-the-haram-of-imam-husayn", "bayn-al-haramayn-at-dusk", "shrine-of-sayyida-zaynab"],
    accent: "crimson",
  },
  {
    slug: "beyond-iraq",
    title: "Mashhad, Qom, Damascus & Madinah",
    summary: "The shrines of the Ahl al-Bayt (a.s.) outside Iraq.",
    videos: ["imam-rida-shrine-night", "shrine-of-sayyida-masuma-qom", "shrine-of-sayyida-zaynab", "jannat-al-baqi"],
    accent: "night",
  },
  {
    slug: "night-ziyarat",
    title: "Ziyarat by Night",
    summary: "The shrines after dark, for quiet reflection.",
    videos: ["night-at-the-haram-of-imam-husayn", "imam-rida-shrine-night", "shrine-of-sayyida-zaynab", "arbaeen-mawakib-at-night"],
    accent: "night",
  },
];

/**
 * Key dates in the Hijri calendar (common Shia dates; some vary by tradition
 * and moon sighting).
 */
export const occasions: Occasion[] = [
  { month: 1, day: 1, title: "Start of Muharram: the mourning season begins", kind: "commemoration", href: "/collections/muharram" },
  { month: 1, day: 10, title: "Ashura: Martyrdom of Imam Husayn (a.s.)", kind: "shahadat", href: "/collections/muharram" },
  { month: 1, day: 25, title: "Martyrdom of Imam Zayn al-Abidin (a.s.)", kind: "shahadat", href: "/shrines/baqi" },
  { month: 2, day: 20, title: "Arbaeen of Imam Husayn (a.s.)", kind: "commemoration", href: "/collections/arbaeen" },
  { month: 2, day: 28, title: "Demise of the Prophet (s.a.w.w.) & martyrdom of Imam Hasan (a.s.)", kind: "shahadat", href: "/shrines/baqi" },
  { month: 2, day: 30, title: "Martyrdom of Imam al-Rida (a.s.)", kind: "shahadat", href: "/shrines/imam-rida" },
  { month: 3, day: 8, title: "Martyrdom of Imam Hasan al-Askari (a.s.)", kind: "shahadat", href: "/shrines/askariyayn" },
  { month: 3, day: 17, title: "Birth of the Prophet (s.a.w.w.) & Imam al-Sadiq (a.s.)", kind: "wiladat", href: "/shrines/baqi" },
  { month: 5, day: 5, title: "Birth of Sayyida Zaynab (s.a.)", kind: "wiladat", href: "/shrines/sayyida-zaynab" },
  { month: 6, day: 3, title: "Martyrdom of Sayyida Fatima al-Zahra (s.a.)", kind: "shahadat", href: "/shrines/baqi" },
  { month: 6, day: 20, title: "Birth of Sayyida Fatima al-Zahra (s.a.)", kind: "wiladat", href: "/shrines/baqi" },
  { month: 7, day: 3, title: "Martyrdom of Imam Ali al-Hadi (a.s.)", kind: "shahadat", href: "/shrines/askariyayn" },
  { month: 7, day: 13, title: "Birth of Imam Ali (a.s.)", kind: "wiladat", href: "/shrines/imam-ali" },
  { month: 7, day: 25, title: "Martyrdom of Imam Musa al-Kadhim (a.s.)", kind: "shahadat", href: "/shrines/kadhimayn" },
  { month: 7, day: 27, title: "Mab'ath: the Prophet's (s.a.w.w.) first revelation", kind: "eid", href: "/videos" },
  { month: 8, day: 3, title: "Birth of Imam Husayn (a.s.)", kind: "wiladat", href: "/shrines/imam-husayn" },
  { month: 8, day: 4, title: "Birth of Hazrat Abbas (a.s.)", kind: "wiladat", href: "/shrines/abbas" },
  { month: 8, day: 15, title: "Birth of Imam al-Mahdi (a.t.f.s.)", kind: "wiladat", href: "/shrines/askariyayn" },
  { month: 9, day: 15, title: "Birth of Imam Hasan al-Mujtaba (a.s.)", kind: "wiladat", href: "/shrines/baqi" },
  { month: 9, day: 21, title: "Martyrdom of Imam Ali (a.s.)", kind: "shahadat", href: "/shrines/imam-ali" },
  { month: 10, day: 1, title: "Eid al-Fitr", kind: "eid", href: "/videos" },
  { month: 10, day: 8, title: "Yawm al-Hadm: demolition of al-Baqi'", kind: "commemoration", href: "/shrines/baqi" },
  { month: 10, day: 25, title: "Martyrdom of Imam Ja'far al-Sadiq (a.s.)", kind: "shahadat", href: "/shrines/baqi" },
  { month: 11, day: 1, title: "Birth of Sayyida Fatima al-Ma'suma (s.a.)", kind: "wiladat", href: "/shrines/masuma" },
  { month: 11, day: 11, title: "Birth of Imam al-Rida (a.s.)", kind: "wiladat", href: "/shrines/imam-rida" },
  { month: 11, day: 29, title: "Martyrdom of Imam Muhammad al-Jawad (a.s.)", kind: "shahadat", href: "/shrines/kadhimayn" },
  { month: 12, day: 7, title: "Martyrdom of Imam Muhammad al-Baqir (a.s.)", kind: "shahadat", href: "/shrines/baqi" },
  { month: 12, day: 9, title: "Day of Arafah", kind: "commemoration", href: "/videos" },
  { month: 12, day: 10, title: "Eid al-Adha", kind: "eid", href: "/videos" },
  { month: 12, day: 18, title: "Eid al-Ghadir", kind: "eid", href: "/shrines/imam-ali" },
  { month: 12, day: 24, title: "Eid al-Mubahala", kind: "eid", href: "/videos" },
];
