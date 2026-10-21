/**
 * Renders a 16:9 poster for every generated placeholder video.
 *   1. npm run dev   2. npm run posters
 * Uses a locally installed Chrome (set CHROME_PATH to override).
 */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "public/media/placeholder/posters";
const only = process.argv.slice(2);
const slugs = [...readFileSync("src/content/videos.ts", "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
for (const slug of slugs.filter((s) => !only.length || only.includes(s))) {
  await page.goto(`${base}/dev/capture?slug=${slug}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-ready=true]", { state: "attached", timeout: 120000 });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/jpeg", 0.86));
  writeFileSync(`${out}/${slug}.jpg`, Buffer.from(data.split(",")[1], "base64"));
  console.log("✓", slug);
}
await browser.close();
