import { buildScene, skyFor } from "./build";
import { paintGround } from "./ground";
import type { Paint, SceneSpec, Shape } from "./types";

const yieldFrame = () => new Promise<void>((r) => setTimeout(r, 0));

function paint(ctx: CanvasRenderingContext2D, p: Paint): string | CanvasGradient {
  if (typeof p === "string") return p;
  const g = ctx.createLinearGradient(0, p.y0, 0, p.y1);
  for (const [o, c] of p.stops) g.addColorStop(o, c);
  return g;
}

/**
 * Render a SceneSpec into an equirectangular canvas (width × width/2).
 * `fontFamily` is used for Arabic banner text.
 */
export async function renderPanorama(spec: SceneSpec, width: number, fontFamily: string): Promise<HTMLCanvasElement> {
  const W = width;
  const H = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  const pal = skyFor(spec);
  const sx = W / 360;
  const toDeg = () => ctx.setTransform(sx, 0, 0, sx, 0, H / 2);

  toDeg();
  const sky = ctx.createLinearGradient(0, -90, 0, 0);
  sky.addColorStop(0, pal.top);
  sky.addColorStop(0.55, pal.mid);
  sky.addColorStop(1, pal.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, -90, 360, 90);
  await yieldFrame();

  const img = ctx.createImageData(W, H);
  paintGround(spec, img.data, W, H, pal);
  ctx.putImageData(img, 0, 0, 0, spec.kind === "hall" ? 0 : H / 2, W, spec.kind === "hall" ? H : H / 2);
  await yieldFrame();

  if (spec.kind !== "hall") {
    toDeg();
    const haze = ctx.createLinearGradient(0, -5, 0, 3);
    haze.addColorStop(0, `${pal.horizon}00`);
    haze.addColorStop(0.62, `${pal.horizon}cc`);
    haze.addColorStop(1, `${pal.horizon}00`);
    ctx.fillStyle = haze;
    ctx.fillRect(0, -5, 360, 8);
  }

  const shapes = buildScene(spec);
  if (shapes.some((s) => s.kind === "text")) {
    try {
      await document.fonts.load(`64px ${fontFamily}`, "يا حسين");
    } catch {
      /* fall back to whatever font is available */
    }
  }
  shapes.forEach((s) => drawShape(ctx, s, sx, H, fontFamily));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape, sx: number, H: number, fontFamily: string) {
  for (const off of [-360, 0, 360]) {
    ctx.save();
    if (s.kind === "text") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const px = (s.x + off) * sx;
      if (px < -2000 || px > 360 * sx + 2000) {
        ctx.restore();
        continue;
      }
      ctx.font = `${Math.round(s.size * sx)}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.direction = "rtl";
      ctx.fillStyle = s.fill;
      if (s.glow) {
        ctx.shadowColor = s.glow.color;
        ctx.shadowBlur = s.glow.blur * sx;
      }
      ctx.fillText(s.text, px, H / 2 + s.y * sx);
      ctx.restore();
      continue;
    }
    ctx.setTransform(sx, 0, 0, sx, off * sx, H / 2);
    if (s.alpha !== undefined) ctx.globalAlpha = s.alpha;
    if (s.glow) {
      ctx.shadowColor = s.glow.color;
      ctx.shadowBlur = s.glow.blur * sx;
    }
    if (s.kind === "circle") {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = paint(ctx, s.fill);
      ctx.fill();
    } else {
      const path = new Path2D(s.d);
      if (s.fill) {
        ctx.fillStyle = paint(ctx, s.fill);
        ctx.fill(path);
      }
      if (s.stroke) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.lineWidth ?? 0.1;
        ctx.stroke(path);
      }
    }
    ctx.restore();
  }
}
