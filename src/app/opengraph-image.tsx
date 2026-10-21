import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const alt = `${site.name}: virtual ziyarat in 360° and VR`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const poster = await readFile(join(process.cwd(), "public/media/placeholder/posters/night-at-the-haram-of-imam-husayn.jpg"));
  const src = `data:image/jpeg;base64,${poster.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#060912" }}>
        <img src={src} alt="" width={1200} height={675} style={{ position: "absolute", top: -20, left: 0, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.1) 70%)" }} />
        <div style={{ position: "absolute", left: 64, bottom: 56, display: "flex", flexDirection: "column", color: "white" }}>
          <div style={{ fontSize: 30, color: "#f2d389", letterSpacing: 6, textTransform: "uppercase" }}>{site.name}</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, marginTop: 12, maxWidth: 900 }}>Virtual ziyarat of the holy shrines in 360° & VR</div>
        </div>
      </div>
    ),
    size,
  );
}
