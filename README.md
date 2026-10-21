# Ziyarat VR

A 360° / VR video library for Shia Islamic content: virtual ziyarat of the holy shrines, the Arbaeen walk, Muharram majalis and historical reconstructions. Videos play in the browser on desktop and phones (drag or gyroscope) and in VR headsets via WebXR (Meta Quest, Vision Pro, Pico).

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4 and three.js.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out (plain HTML/CSS/JS, host anywhere)
npx serve out      # preview the production build
```

## Deployment

Every push to `main` is built and published to **GitHub Pages** by `.github/workflows/deploy.yml`. The workflow sets `NEXT_PUBLIC_BASE_PATH` (e.g. `/ziyarat-vr`) and `NEXT_PUBLIC_SITE_ORIGIN` automatically from the repository's Pages settings. With a custom domain the base path becomes empty and nothing else needs to change.

> If the build fails with `Failed to fetch … from Google Fonts` / `ETIMEDOUT`, your network has broken IPv6. Run
> `NODE_OPTIONS=--dns-result-order=ipv4first npm run build`.

## Adding real videos

All content lives in typed data files in `src/content/`:

| File | What it holds |
| --- | --- |
| `videos.ts` | Every video: title, description, shrine, category, format, source, poster, duration |
| `shrines.ts` | The shrines: names, who rests there, history, recommended ziyarat, coordinates |
| `collections.ts` | Curated playlists and the Hijri calendar of occasions |

The current videos are **placeholders**: 360° scenes generated in the browser (`source.type: "generated"`). To publish real footage, edit the video entry:

```ts
source: { type: "file", src: "https://cdn.example.com/karbala-night-8k.mp4" },
format: "360-mono",          // or "360-stereo-tb" (3D top/bottom) or "180-stereo-sbs" (VR180)
poster: "/media/karbala-night.jpg",   // 16:9 still
duration: 412,
```

- Video files must be **equirectangular**. Serve them from a CDN with CORS enabled (`Access-Control-Allow-Origin`), since WebGL needs cross-origin access to draw them.
- A YouTube 360° video can be listed without re-hosting: `source: { type: "youtube", id: "VIDEO_ID" }`.
- Replace `views` with real numbers from your analytics and remove the `credits` placeholder line.

Before launch, set `contactEmail` in `src/lib/site.ts`.

## Features

- **360° player** (`src/components/player/Vr360Player.tsx`): drag/pinch/wheel, keyboard shortcuts, gyroscope on phones, "Enter VR" (WebXR, with the controller trigger to play/pause), stereo 3D and VR180, resume where you left off, and pausing when off-screen.
- **Library** with search, filters (shrine, category, length) and sorting, all synced to the URL.
- **Shrine pages** with history, recommended ziyarat and a map link. **Collections** as ordered playlists.
- **Hijri calendar**: today's date and upcoming births, martyrdoms and Eids, each linked to related videos (`?hijri-test=YYYY-MM-DD` on the home page simulates a date).
- **Saved**: favourites, watch later and continue watching, stored on the device with no account.
- **Embeds**: `/embed/<slug>` is a chrome-less player that mosques and centres can drop into an `<iframe>` (the Embed button generates the code).
- ⌘K search, dark/light themes, SEO metadata, `VideoObject` JSON-LD, sitemap and an Open Graph image.
- **Mobile-first**: bottom tab bar, 44px touch targets, safe-area support for notched phones, full-screen search, an iPhone full-screen fallback with landscape lock, gyroscope look-around, and installation to the home screen (web app manifest).
- **Light on data**: card thumbnails (~30 KB), only the font weights in use, no prefetching from cards, and the home page's live 3D scene loads only once the page is idle (never on data-saver or 2G).

## Placeholder scenes & posters

Generated scenes are described by a `SceneSpec` (`src/lib/scene/types.ts`) and drawn by `src/lib/scene/`. Their poster thumbnails are pre-rendered JPGs in `public/media/placeholder/posters/`. If you change a scene, regenerate its poster:

```bash
npm run dev
npm run posters                 # all, or: npm run posters <slug> …
npm run thumbs                  # 800px card thumbnails (-thumb.jpg) for every poster
```

This uses the local Chrome at `/usr/bin/google-chrome` (override with `CHROME_PATH`) and the dev-only route `/dev/capture?slug=<slug>`, which renders nothing in production builds.
