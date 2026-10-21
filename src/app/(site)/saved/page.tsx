import type { Metadata } from "next";
import { SavedLibrary } from "@/components/SavedLibrary";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Your library</p>
      <h1 className="font-display mt-1 text-4xl font-semibold sm:text-5xl">Saved</h1>
      <SavedLibrary />
    </div>
  );
}
