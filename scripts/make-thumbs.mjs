/**
 * Writes an 800px-wide "-thumb.jpg" next to every poster in public/media,
 * used for cards and lists (full posters stay for large hero images).
 *   npm run thumbs
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

function* jpgs(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* jpgs(p);
    else if (/\.jpe?g$/i.test(f) && !/-thumb\.jpe?g$/i.test(f)) yield p;
  }
}

for (const src of jpgs("public/media")) {
  const out = src.replace(/\.jpe?g$/i, "-thumb.jpg");
  const info = await sharp(src).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(out);
  console.log(`✓ ${out} (${(info.size / 1024).toFixed(0)} KB)`);
}
