import { site } from "@/lib/site";

/** Eight-pointed star (khatam) enclosing a dome: the site mark. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc95" />
          <stop offset="1" stopColor="#b8862c" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#logo-gold)" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="8" y="8" width="24" height="24" rx="1" />
        <rect x="8" y="8" width="24" height="24" rx="1" transform="rotate(45 20 20)" />
      </g>
      <path d="M13.5 27c0-5 2.6-7.4 4.6-8.8 1.2-.9 1.9-2 1.9-3.4 0 1.4.7 2.5 1.9 3.4 2 1.4 4.6 3.8 4.6 8.8Z" fill="url(#logo-gold)" />
      <path d="M20 11.4v3" stroke="url(#logo-gold)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-semibold tracking-wide">{site.name}</span>
        <span className="arabic text-[0.7rem] text-gold-ink">{site.arabicName}</span>
      </span>
    </span>
  );
}
