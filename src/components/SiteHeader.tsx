"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { Icon } from "./Icons";
import { Logo } from "./Logo";
import { SearchButton } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${scrolled || menuOpen ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex h-11 shrink-0 items-center" aria-label="Ziyarat VR home">
          <Logo />
        </Link>
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-3 py-2 text-sm transition ${isActive(n.href) ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <SearchButton />
          <Link
            href="/saved"
            className={`hidden size-10 place-items-center rounded-full transition hover:bg-surface-2 lg:grid ${isActive("/saved") ? "text-gold-ink" : "text-muted hover:text-fg"}`}
            aria-label="Saved videos"
            title="Saved"
          >
            <Icon name="heart" />
          </Link>
          <ThemeToggle />
          <button
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-nav" className="border-t border-line px-4 pt-2 pb-4 lg:hidden" aria-label="Mobile">
          {[...nav, { href: "/about", label: "About" }].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-xl px-3 py-3 text-base ${isActive(n.href) ? "bg-surface-2 text-fg" : "text-muted"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
