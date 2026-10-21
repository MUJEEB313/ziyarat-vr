import * as THREE from "three";
import { rng } from "./geometry";
import type { Particles } from "./types";

interface System {
  points: THREE.Points;
  update: (t: number) => void;
  dispose: () => void;
}

function sprite(soft: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(soft ? 0.25 : 0.55, "rgba(255,255,255,0.8)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Animated particle layers drawn in front of the panorama. Positions are a
 * pure function of time so seeking the timeline is deterministic.
 */
function createSystem(kind: Particles, seed: number): System {
  const R = rng(seed);
  const cfg = {
    lights: { n: 140, color: 0xffc977, size: 0.38, additive: true, opacity: 0.75 },
    pigeons: { n: 70, color: 0x3a3a40, size: 0.32, additive: false, opacity: 0.9 },
    motes: { n: 260, color: 0xffe2a8, size: 0.05, additive: true, opacity: 0.7 },
    dust: { n: 200, color: 0xd9c19a, size: 0.09, additive: false, opacity: 0.35 },
  }[kind];
  const seeds = Array.from({ length: cfg.n }, () => [R(), R(), R(), R(), R()]);
  const pos = new Float32Array(cfg.n * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const tex = sprite(kind !== "pigeons");
  const mat = new THREE.PointsMaterial({
    color: cfg.color,
    size: cfg.size,
    map: tex,
    transparent: true,
    opacity: cfg.opacity,
    depthWrite: false,
    blending: cfg.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  const update = (t: number) => {
    for (let i = 0; i < cfg.n; i++) {
      const [a, b, c, d, e] = seeds[i];
      let x = 0;
      let y = 0;
      let z = 0;
      if (kind === "lights") {
        const ang = a * Math.PI * 2;
        const r = 10 + b * 45;
        const speed = 0.25 + c * 0.45;
        y = ((d * 40 + speed * t) % 40) - 1;
        const sway = Math.sin(t * 0.6 + e * 10) * 0.8;
        x = Math.sin(ang) * r + sway;
        z = Math.cos(ang) * r;
      } else if (kind === "pigeons") {
        // Flocks circling above the dome straight ahead.
        const flock = Math.floor(a * 3);
        const cx = (flock - 1) * 14;
        const cz = -55 + flock * 6;
        const r = 6 + b * 14;
        const w = (0.35 + c * 0.35) * (flock % 2 ? 1 : -1);
        const ang = e * Math.PI * 2 + t * w;
        x = cx + Math.cos(ang) * r;
        z = cz + Math.sin(ang) * r;
        y = 14 + d * 12 + Math.sin(t * 1.3 + e * 20) * 1.5;
      } else if (kind === "motes") {
        x = ((a * 20 + Math.sin(t * 0.1 + e * 6) * 1.5 + 30) % 20) - 10;
        z = ((b * 14 + Math.cos(t * 0.08 + d * 6) * 1.5 + 21) % 14) - 7;
        y = ((c * 4.6 + t * 0.03 * (d - 0.5)) % 4.6 + 4.6) % 4.6 - 1.1;
      } else {
        x = ((a * 60 + t * (0.6 + c)) % 60) - 30;
        z = (b - 0.5) * 60;
        y = -1.5 + d * 2.5 + Math.sin(t + e * 10) * 0.2;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
  };
  update(0);

  return {
    points,
    update,
    dispose: () => {
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}

export function createParticles(kinds: Particles[], seed: number) {
  const systems = kinds.map((k, i) => createSystem(k, seed + i * 101));
  const group = new THREE.Group();
  systems.forEach((s) => group.add(s.points));
  return {
    group,
    update: (t: number) => systems.forEach((s) => s.update(t)),
    dispose: () => systems.forEach((s) => s.dispose()),
  };
}
