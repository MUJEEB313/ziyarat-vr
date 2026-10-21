"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/videos", label: "Library", icon: "library" },
  { href: "/shrines", label: "Shrines", icon: "dome" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/saved", label: "Saved", icon: "heart" },
];

/** App-style bottom navigation for phones and small tablets (hidden on desktop). */
export function MobileTabBar() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg px-[max(0.5rem,env(safe-area-inset-left))]">
        {TABS.map((t) => {
          const on = active(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${on ? "text-gold-ink" : "text-muted active:text-fg"}`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${on ? "bg-gold/15" : ""}`}>
                  <Icon name={t.icon} size={21} fill={on && t.icon === "heart" ? "currentColor" : "none"} />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
