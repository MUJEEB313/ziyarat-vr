import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getVideo, videos } from "@/content";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = getVideo((await params).slug);
  return { title: video?.title, robots: { index: false } };
}

/** Chrome-less player for embedding on other websites via <iframe>. */
export default async function EmbedPage({ params }: Props) {
  const video = getVideo((await params).slug);
  if (!video) notFound();
  return (
    <div className="fixed inset-0 bg-black">
      <VideoPlayer video={video} className="h-full w-full" />
      <Link
        href={`/videos/${video.slug}`}
        target="_blank"
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 py-1 pr-3 pl-1.5 text-xs text-white backdrop-blur hover:bg-black/75"
      >
        <LogoMark size={20} /> Watch on {site.name}
      </Link>
    </div>
  );
}
