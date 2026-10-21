/**
 * Sub-path the site is served from (e.g. "/ziyarat-vr" on GitHub Pages).
 * Set at build time; empty when served from a domain root.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative public file path (e.g. "/media/x.jpg") with the base path. */
export const asset = (path: string) => (path.startsWith("/") ? `${basePath}${path}` : path);

const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://example.com";

/** Site-wide settings. Rename the site or change the contact address here. */
export const site = {
  name: "Ziyarat VR",
  arabicName: "زيارة",
  tagline: "Virtual ziyarat of the holy shrines of the Ahl al-Bayt (a.s.) in 360° and VR",
  description:
    "Watch 360° and VR videos of the holy shrines of Karbala, Najaf, Kadhimiya, Samarra, Mashhad, Qom, Damascus and Madinah, plus the Arbaeen walk and Muharram majalis, in your browser or in a VR headset.",
  /** Scheme + host, e.g. "https://name.github.io". Set NEXT_PUBLIC_SITE_ORIGIN at build time. */
  origin,
  /** Full public URL of the site root, including the base path. */
  url: `${origin}${basePath}`,
  // PLACEHOLDER: set to a real inbox.
  contactEmail: "hello@example.com",
};

export const nav = [
  { href: "/videos", label: "Library" },
  { href: "/shrines", label: "Shrines" },
  { href: "/collections", label: "Collections" },
  { href: "/calendar", label: "Calendar" },
  { href: "/how-to-watch", label: "How to watch" },
];
