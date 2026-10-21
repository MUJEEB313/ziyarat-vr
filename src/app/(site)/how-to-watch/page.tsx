import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";

export const metadata: Metadata = {
  title: "How to watch in 360° & VR",
  description: "Watch virtual ziyarat on your phone, computer, Google Cardboard, Meta Quest or Apple Vision Pro.",
};

const DEVICES: { icon: IconName; title: string; steps: string[] }[] = [
  {
    icon: "phone",
    title: "Phone or tablet",
    steps: [
      "Open any video and tap play.",
      "Tap the motion button to look around by moving your phone. On iPhone, allow motion access when asked.",
      "Or drag with one finger to look, and pinch to zoom.",
      "Turn your phone sideways and tap full screen for the most immersive view.",
    ],
  },
  {
    icon: "headset",
    title: "Meta Quest, Pico & other headsets",
    steps: [
      "Open this website in the headset's built-in browser.",
      "Open a video and press the gold “Enter VR” button.",
      "Look around naturally. Press the controller trigger to play or pause.",
      "Press the Meta / home button to leave VR and return to the page.",
    ],
  },
  {
    icon: "eye",
    title: "Apple Vision Pro",
    steps: [
      "Open the site in Safari. WebXR is supported in visionOS 2 and later.",
      "Tap “Enter VR” on any video to be surrounded by the shrine.",
      "Pinch to play or pause.",
    ],
  },
  {
    icon: "monitor",
    title: "Computer",
    steps: ["Click and drag to look around, or use the arrow keys.", "Scroll or press + / − to zoom.", "Press F for full screen."],
  },
];

const KEYS = [
  ["Space / K", "Play or pause"],
  ["← → ↑ ↓", "Look around"],
  ["J / L", "Back / forward 10 seconds"],
  ["+ / −", "Zoom in / out"],
  ["R", "Recenter the view"],
  ["F", "Full screen"],
  ["M", "Mute"],
  ["⌘K or /", "Search the site"],
];

export default function HowToWatchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Viewing guide</p>
      <h1 className="font-display mt-1 text-4xl font-semibold sm:text-5xl">How to watch in 360° & VR</h1>
      <p className="mt-3 max-w-2xl text-muted">No app to install. Every video plays in your web browser, and the same page works on a phone, computer or VR headset.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {DEVICES.map((d) => (
          <section key={d.title} className="rounded-2xl border border-line bg-surface p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-gold/15 text-gold-ink">
              <Icon name={d.icon} size={24} />
            </span>
            <h2 className="mt-4 text-xl font-semibold">{d.title}</h2>
            <ol className="mt-3 space-y-2">
              {d.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed text-fg/85">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-gold-ink">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-semibold">Keyboard shortcuts</h2>
        <dl className="mt-5 grid gap-x-8 rounded-2xl border border-line bg-surface p-2 sm:grid-cols-2">
          {KEYS.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
              <dt className="text-sm text-muted">{v}</dt>
              <dd>
                <kbd className="rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-sans text-xs">{k}</kbd>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold">Troubleshooting</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg/85">
          <li>
            <strong>No “Enter VR” button?</strong> Your browser doesn&apos;t support WebXR. Use your headset&apos;s built-in browser, or Chrome on Android.
          </li>
          <li>
            <strong>No motion button on iPhone?</strong> Make sure you&apos;re on the secure (https) version of the site, then tap the button and allow motion access.
          </li>
          <li>
            <strong>Picture looks blurry?</strong> 360° video spreads its pixels across the whole sphere. Zoom out a little, or use a faster connection.
          </li>
        </ul>
      </section>

      <Link href="/videos" className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-black transition hover:bg-gold-strong">
        <Icon name="play" size={20} /> Start watching
      </Link>
    </div>
  );
}
