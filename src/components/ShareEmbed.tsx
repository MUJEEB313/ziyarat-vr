"use client";

import { useState } from "react";
import { basePath } from "@/lib/site";
import { Icon } from "./Icons";

export function ShareEmbed({ slug, title }: { slug: string; title: string }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const url = () => `${window.location.origin}${basePath}/videos/${slug}`;
  const embedCode = () =>
    `<iframe src="${window.location.origin}${basePath}/embed/${slug}" title="${title.replace(/"/g, "&quot;")}" width="960" height="540" allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen style="border:0;border-radius:12px;max-width:100%;aspect-ratio:16/9;height:auto"></iframe>`;

  const copy = async (text: string, what: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked: the embed code is still selectable */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: url() });
        return;
      } catch {
        /* cancelled: fall through to copy */
      }
    }
    copy(url(), "link");
  };

  return (
    <>
      <button onClick={share} className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium transition hover:bg-surface-2">
        <Icon name={copied === "link" ? "check" : "share"} size={18} /> {copied === "link" ? "Link copied" : "Share"}
      </button>
      <button
        onClick={() => setShowEmbed((s) => !s)}
        aria-expanded={showEmbed}
        className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium transition hover:bg-surface-2"
      >
        <Icon name="code" size={18} /> Embed
      </button>
      {showEmbed && (
        <div className="w-full rounded-2xl border border-line bg-surface p-4">
          <p className="mb-2 text-sm text-muted">Add this 360° player to your mosque, centre or blog website:</p>
          <textarea readOnly value={embedCode()} rows={3} className="w-full resize-none rounded-xl border border-line bg-bg p-3 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
          <button onClick={() => copy(embedCode(), "embed")} className="mt-2 flex h-9 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-black">
            <Icon name={copied === "embed" ? "check" : "code"} size={16} /> {copied === "embed" ? "Copied" : "Copy code"}
          </button>
        </div>
      )}
    </>
  );
}
