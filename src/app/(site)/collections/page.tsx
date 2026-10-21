import type { Metadata } from "next";
import { CollectionCard } from "@/components/Cards";
import { collections } from "@/content";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated journeys: the shrines of Iraq, Arbaeen, Muharram, and the shrines beyond Iraq.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Curated journeys</p>
      <h1 className="font-display mt-1 text-4xl font-semibold sm:text-5xl">Collections</h1>
      <p className="mt-3 max-w-2xl text-muted">Playlists that take you through a pilgrimage from start to finish. Watch them in order, or jump to any stop.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {collections.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  );
}
