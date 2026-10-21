/**
 * Renders the PWA / home-screen icons from the site mark.
 *   node scripts/make-icons.mjs
 */
import sharp from "sharp";

const mark = (pad) => {
  // The star-and-dome mark on the night background; `pad` shrinks it toward the centre (maskable safe zone).
  const s = 40 - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc95"/><stop offset="1" stop-color="#b8862c"/></linearGradient></defs>
  <rect width="40" height="40" fill="#060912"/>
  <g transform="translate(${pad} ${pad}) scale(${s / 40})">
    <g fill="none" stroke="url(#g)" stroke-width="1.8" stroke-linejoin="round"><rect x="9" y="9" width="22" height="22" rx="1"/><rect x="9" y="9" width="22" height="22" rx="1" transform="rotate(45 20 20)"/></g>
    <path d="M14 27c0-4.8 2.4-7 4.3-8.4 1.1-.8 1.7-1.9 1.7-3.2 0 1.3.6 2.4 1.7 3.2 1.9 1.4 4.3 3.6 4.3 8.4Z" fill="url(#g)"/>
  </g></svg>`;
};

const jobs = [
  ["public/icons/icon-192.png", 192, 0],
  ["public/icons/icon-512.png", 512, 0],
  ["public/icons/maskable-512.png", 512, 6],
  ["src/app/apple-icon.png", 180, 3],
];
for (const [out, size, pad] of jobs) {
  await sharp(Buffer.from(mark(pad)), { density: 1200 }).resize(size, size).png().toFile(out);
  console.log("✓", out);
}
