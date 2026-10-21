"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Icon } from "@/components/Icons";
import { formatDuration } from "@/lib/format";
import { createParticles } from "@/lib/scene/particles";
import { renderPanorama } from "@/lib/scene/render";
import type { SceneSpec } from "@/lib/scene/types";
import { getProgress, saveProgress } from "@/lib/storage";
import type { VideoFormat, VideoSource } from "@/lib/types";

export type PlayerMode = "full" | "ambient" | "capture";

export interface Vr360PlayerProps {
  source: Exclude<VideoSource, { type: "youtube" }>;
  format: VideoFormat;
  /** Duration in seconds (used for generated scenes; files report their own). */
  duration: number;
  title: string;
  poster?: string;
  /** Saves and resumes watch progress under this key. */
  slug?: string;
  /** full: complete controls. ambient: slow auto-rotate, no UI. capture: fixed frame for thumbnails. */
  mode?: PlayerMode;
  autoPlay?: boolean;
  className?: string;
}

const MIN_FOV = 35;
const MAX_FOV = 100;
const PITCH_LIMIT = (85 * Math.PI) / 180;

/** Generated panoramas are cached so returning to a page is instant. */
const panoramaCache = new Map<string, Promise<HTMLCanvasElement>>();
function getPanorama(spec: SceneSpec, width: number, font: string) {
  const key = `${width}:${JSON.stringify(spec)}`;
  let p = panoramaCache.get(key);
  if (!p) {
    p = renderPanorama(spec, width, font);
    panoramaCache.set(key, p);
    p.catch(() => panoramaCache.delete(key));
  }
  return p;
}

type DOEvent = DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
type DOConstructor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/** Build the projection mesh(es) for a texture in the given format. */
function buildMeshes(texture: THREE.Texture, format: VideoFormat) {
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const meshes: THREE.Mesh[] = [];
  const remapUV = (g: THREE.BufferGeometry, fn: (u: number, v: number) => [number, number]) => {
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      const [u, v] = fn(uv.getX(i), uv.getY(i));
      uv.setXY(i, u, v);
    }
  };
  if (format === "360-mono") {
    const g = new THREE.SphereGeometry(500, 96, 64);
    g.scale(-1, 1, 1);
    const m = new THREE.Mesh(g, material);
    m.rotation.y = -Math.PI / 2;
    meshes.push(m);
  } else {
    const is180 = format === "180-stereo-sbs";
    for (const eye of [1, 2] as const) {
      const g = is180 ? new THREE.SphereGeometry(500, 64, 64, Math.PI, Math.PI) : new THREE.SphereGeometry(500, 96, 64);
      g.scale(-1, 1, 1);
      remapUV(g, (u, v) =>
        is180 ? [u * 0.5 + (eye === 1 ? 0 : 0.5), v] : [u, v * 0.5 + (eye === 1 ? 0.5 : 0)],
      );
      const m = new THREE.Mesh(g, material);
      if (!is180) m.rotation.y = -Math.PI / 2;
      // Layer 1 = left eye (also used for the flat view), layer 2 = right eye.
      m.layers.set(eye);
      meshes.push(m);
    }
  }
  return { meshes, material };
}

export default function Vr360Player({
  source,
  format,
  duration: declaredDuration,
  title,
  poster,
  slug,
  mode = "full",
  autoPlay = false,
  className = "",
}: Vr360PlayerProps) {
  const full = mode === "full";
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  // Mutable engine state, kept out of React to avoid re-rendering every frame.
  const eng = useRef({
    yaw: 0,
    pitch: 0,
    fov: 75,
    targetFov: 75,
    time: 0,
    playing: false,
    duration: declaredDuration,
    video: null as HTMLVideoElement | null,
    gyro: false,
    gyroQuat: new THREE.Quaternion(),
    gyroYawOffset: 0,
    lastInteraction: 0,
    renderer: null as THREE.WebGLRenderer | null,
    session: null as XRSession | null,
  });

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(declaredDuration);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [gyroAvailable, setGyroAvailable] = useState(false);
  const [gyroOn, setGyroOn] = useState(false);
  const [xrSupported, setXrSupported] = useState(false);
  const [inXR, setInXR] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hint, setHint] = useState(full);
  const [resumedAt, setResumedAt] = useState<number | null>(null);

  const isGenerated = source.type === "generated";
  const sourceKey = source.type === "file" ? source.src : JSON.stringify(source.scene);

  /* ------------------------------------------------------------ playback */

  const play = useCallback(() => {
    const e = eng.current;
    setStarted(true);
    setEnded(false);
    setHint(false);
    if (e.video) {
      e.video.play().catch(() => setError("Playback was blocked by the browser. Tap play to try again."));
    } else {
      if (e.time >= e.duration - 0.05) e.time = 0;
      e.playing = true;
      setPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    const e = eng.current;
    if (e.video) e.video.pause();
    else {
      e.playing = false;
      setPlaying(false);
    }
    if (slug) saveProgress(slug, e.video?.currentTime ?? e.time, e.duration);
  }, [slug]);

  const togglePlay = useCallback(() => {
    const e = eng.current;
    const isPlaying = e.video ? !e.video.paused : e.playing;
    if (isPlaying) pause();
    else play();
  }, [play, pause]);

  const seek = useCallback((t: number) => {
    const e = eng.current;
    const clamped = Math.max(0, Math.min(e.duration, t));
    if (e.video) e.video.currentTime = clamped;
    else e.time = clamped;
    setCurrent(clamped);
    setEnded(false);
  }, []);

  const recenter = useCallback(() => {
    const e = eng.current;
    e.pitch = 0;
    e.targetFov = 75;
    if (e.gyro) {
      const euler = new THREE.Euler().setFromQuaternion(e.gyroQuat, "YXZ");
      e.gyroYawOffset = -euler.y;
    } else e.yaw = 0;
  }, []);

  const zoom = useCallback((delta: number) => {
    const e = eng.current;
    e.targetFov = Math.max(MIN_FOV, Math.min(MAX_FOV, e.targetFov + delta));
  }, []);

  /* --------------------------------------------------------------- engine */

  useEffect(() => {
    const host = canvasHostRef.current;
    const container = containerRef.current;
    if (!host || !container) return;
    const e = eng.current;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: mode === "capture", powerPreference: "high-performance" });
    } catch {
      setError("Your browser could not start WebGL, which is needed for 360° playback.");
      return;
    }
    e.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-label", `360° view: ${title}`);
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(e.fov, 1, 0.1, 2000);
    camera.layers.enable(1);
    camera.rotation.order = "YXZ";

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const cleanups: (() => void)[] = [];
    let particles: ReturnType<typeof createParticles> | null = null;
    e.time = 0;
    e.yaw = 0;
    e.pitch = mode === "capture" ? 0.12 : mode === "ambient" ? 0.14 : 0;
    e.targetFov = e.fov = mode === "capture" ? 80 : 75;

    // Resume where the viewer left off.
    const saved = slug && full ? getProgress(slug) : undefined;

    const load = async () => {
      let texture: THREE.Texture;
      if (source.type === "generated") {
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const max = renderer.capabilities.maxTextureSize;
        const width = coarse || max < 4096 ? 2048 : 4096;
        const font = getComputedStyle(document.documentElement).getPropertyValue("--font-amiri").trim() || "serif";
        const canvas = await getPanorama(source.scene, width, font);
        if (disposed) return;
        texture = new THREE.CanvasTexture(canvas);
        particles = createParticles(source.scene.particles, source.scene.seed);
        scene.add(particles.group);
        e.duration = declaredDuration;
        if (saved) {
          e.time = saved.t;
          setCurrent(saved.t);
          setResumedAt(saved.t);
        }
      } else {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.playsInline = true;
        video.preload = "metadata";
        video.src = source.src;
        e.video = video;
        const on = (ev: string, fn: () => void) => {
          video.addEventListener(ev, fn);
          cleanups.push(() => video.removeEventListener(ev, fn));
        };
        on("loadedmetadata", () => {
          e.duration = video.duration || declaredDuration;
          setDuration(e.duration);
          if (saved && saved.t < e.duration - 5) {
            video.currentTime = saved.t;
            setResumedAt(saved.t);
          }
        });
        on("play", () => setPlaying(true));
        on("pause", () => setPlaying(false));
        on("waiting", () => setBuffering(true));
        on("playing", () => setBuffering(false));
        on("ended", () => {
          setEnded(true);
          if (slug) saveProgress(slug, e.duration, e.duration);
        });
        on("error", () => setError("This video could not be loaded."));
        texture = new THREE.VideoTexture(video);
        cleanups.push(() => {
          video.pause();
          video.removeAttribute("src");
          video.load();
          e.video = null;
        });
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (source.type === "generated") {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
      }
      const { meshes, material } = buildMeshes(texture, format);
      meshes.forEach((m) => scene.add(m));
      cleanups.push(() => {
        meshes.forEach((m) => m.geometry.dispose());
        material.dispose();
        texture.dispose();
      });
      setReady(true);
      if (mode === "capture") container.dataset.ready = "true";
      if (autoPlay || mode === "ambient") {
        if (e.video) {
          e.video.muted = true;
          setMuted(true);
        }
        play();
      }
    };
    load().catch(() => !disposed && setError("Could not prepare this 360° scene."));

    /* ---- pointer look (drag), pinch & wheel zoom ---- */
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;
    let moved = 0;
    const el = renderer.domElement;
    const onDown = (ev: PointerEvent) => {
      el.setPointerCapture(ev.pointerId);
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      moved = 0;
      e.lastInteraction = performance.now();
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (ev: PointerEvent) => {
      const prev = pointers.get(ev.pointerId);
      if (!prev) return;
      const dx = ev.clientX - prev.x;
      const dy = ev.clientY - prev.y;
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      e.lastInteraction = performance.now();
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        zoom((pinchDist - d) * 0.15);
        pinchDist = d;
        return;
      }
      moved += Math.abs(dx) + Math.abs(dy);
      const k = ((camera.fov * Math.PI) / 180) / host.clientHeight;
      if (e.gyro) e.gyroYawOffset += dx * k;
      else e.yaw += dx * k;
      if (!e.gyro) e.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, e.pitch + dy * k));
      if (moved > 6) setHint(false);
    };
    const onUp = (ev: PointerEvent) => {
      pointers.delete(ev.pointerId);
      // A tap (not a drag) toggles play in full mode.
      if (full && moved < 6 && ev.pointerType !== "mouse") setControlsVisible((v) => !v);
      else if (full && moved < 6) togglePlay();
    };
    const onWheel = (ev: WheelEvent) => {
      if (!full) return;
      ev.preventDefault();
      zoom(ev.deltaY * 0.04);
    };
    if (mode !== "capture") {
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      el.addEventListener("wheel", onWheel, { passive: false });
      el.style.touchAction = "none";
      el.style.cursor = "grab";
      cleanups.push(() => {
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("wheel", onWheel);
      });
    }

    /* ---- gyroscope ---- */
    const zee = new THREE.Vector3(0, 0, 1);
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    const euler = new THREE.Euler();
    const onOrient = (ev: DOEvent) => {
      if (ev.alpha === null || ev.beta === null || ev.gamma === null) return;
      const orient = ((screen.orientation?.angle ?? 0) * Math.PI) / 180;
      euler.set((ev.beta * Math.PI) / 180, (ev.alpha * Math.PI) / 180, (-ev.gamma * Math.PI) / 180, "YXZ");
      e.gyroQuat.setFromEuler(euler).multiply(q1).multiply(q0.setFromAxisAngle(zee, -orient));
    };
    window.addEventListener("deviceorientation", onOrient);
    cleanups.push(() => window.removeEventListener("deviceorientation", onOrient));
    if (full && "DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches) setGyroAvailable(true);

    /* ---- WebXR ---- */
    if (full && navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then((ok) => !disposed && setXrSupported(ok)).catch(() => {});
      const controller = renderer.xr.getController(0);
      const onSelect = () => togglePlay();
      controller.addEventListener("select", onSelect);
      scene.add(controller);
      cleanups.push(() => controller.removeEventListener("select", onSelect));
    }

    /* ---- render loop (paused while off-screen) ---- */
    const clock = new THREE.Clock();
    let lastUi = 0;
    let lastSave = 0;
    const yawQ = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (now: number) => {
      const dt = Math.min(clock.getDelta(), 0.1);
      if (!e.video && e.playing) {
        e.time += dt;
        if (e.time >= e.duration) {
          if (mode === "ambient") e.time = 0;
          else {
            e.time = e.duration;
            e.playing = false;
            setPlaying(false);
            setEnded(true);
            if (slug) saveProgress(slug, e.duration, e.duration);
          }
        }
      }
      const t = e.video ? e.video.currentTime : e.time;
      particles?.update(mode === "ambient" ? now / 1000 : t);

      if (!renderer.xr.isPresenting) {
        if (mode === "ambient" && !reduceMotion && now - e.lastInteraction > 2500) e.yaw += dt * 0.045;
        if (e.gyro) {
          yawQ.setFromAxisAngle(yAxis, e.gyroYawOffset);
          camera.quaternion.copy(e.gyroQuat).premultiply(yawQ);
        } else {
          camera.rotation.set(e.pitch, e.yaw, 0, "YXZ");
        }
        if (Math.abs(e.fov - e.targetFov) > 0.01) {
          e.fov += (e.targetFov - e.fov) * Math.min(1, dt * 10);
          camera.fov = e.fov;
          camera.updateProjectionMatrix();
        }
      }
      renderer.render(scene, camera);

      if (now - lastUi > 250) {
        lastUi = now;
        if (full) setCurrent(t);
      }
      const isPlaying = e.video ? !e.video.paused : e.playing;
      if (slug && full && isPlaying && now - lastSave > 5000) {
        lastSave = now;
        saveProgress(slug, t, e.duration);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || renderer.xr.isPresenting) renderer.setAnimationLoop(tick);
      else renderer.setAnimationLoop(null);
    });
    io.observe(container);
    renderer.setAnimationLoop(tick);

    return () => {
      disposed = true;
      if (slug && full && (e.video ? e.video.currentTime : e.time) > 0) saveProgress(slug, e.video ? e.video.currentTime : e.time, e.duration);
      io.disconnect();
      ro.disconnect();
      renderer.setAnimationLoop(null);
      e.session?.end().catch(() => {});
      cleanups.forEach((c) => c());
      particles?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      e.renderer = null;
      e.playing = false;
      setReady(false);
      setPlaying(false);
    };
    // Rebuild only when the media itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, format, mode]);

  /* ------------------------------------------------------- UI behaviours */

  // Auto-hide controls while playing.
  useEffect(() => {
    if (!full || !playing || !controlsVisible) return;
    const id = setTimeout(() => setControlsVisible(false), 3200);
    return () => clearTimeout(id);
  }, [full, playing, controlsVisible, current]);

  useEffect(() => {
    if (!full) return;
    const onFs = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [full]);

  useEffect(() => {
    if (resumedAt === null) return;
    const id = setTimeout(() => setResumedAt(null), 6000);
    return () => clearTimeout(id);
  }, [resumedAt]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    const v = eng.current.video;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const changeVolume = useCallback((val: number) => {
    const v = eng.current.video;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(v.muted);
  }, []);

  const toggleGyro = useCallback(async () => {
    const e = eng.current;
    if (e.gyro) {
      e.gyro = false;
      setGyroOn(false);
      return;
    }
    const DOE = window.DeviceOrientationEvent as DOConstructor | undefined;
    try {
      if (DOE?.requestPermission && (await DOE.requestPermission()) !== "granted") return;
    } catch {
      return;
    }
    // Keep looking where we were looking when switching on.
    const euler = new THREE.Euler().setFromQuaternion(e.gyroQuat, "YXZ");
    e.gyroYawOffset = e.yaw - euler.y;
    e.gyro = true;
    setGyroOn(true);
  }, []);

  const enterVR = useCallback(async () => {
    const e = eng.current;
    const renderer = e.renderer;
    if (!renderer || !navigator.xr) return;
    try {
      const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"] });
      e.session = session;
      session.addEventListener("end", () => {
        e.session = null;
        setInXR(false);
      });
      await renderer.xr.setSession(session);
      setInXR(true);
      play();
    } catch {
      setError("Could not start VR mode on this device.");
    }
  }, [play]);

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (!full) return;
    const e = eng.current;
    const step = 0.12;
    switch (ev.key) {
      case " ":
      case "k":
        togglePlay();
        break;
      case "ArrowLeft":
        e.yaw += step;
        break;
      case "ArrowRight":
        e.yaw -= step;
        break;
      case "ArrowUp":
        e.pitch = Math.min(PITCH_LIMIT, e.pitch + step);
        break;
      case "ArrowDown":
        e.pitch = Math.max(-PITCH_LIMIT, e.pitch - step);
        break;
      case "j":
        seek((e.video?.currentTime ?? e.time) - 10);
        break;
      case "l":
        seek((e.video?.currentTime ?? e.time) + 10);
        break;
      case "+":
      case "=":
        zoom(-8);
        break;
      case "-":
        zoom(8);
        break;
      case "f":
        toggleFullscreen();
        break;
      case "m":
        toggleMute();
        break;
      case "r":
        recenter();
        break;
      default:
        return;
    }
    ev.preventDefault();
    setHint(false);
    setControlsVisible(true);
  };

  const showControls = full && (controlsVisible || !playing);
  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`group/player relative isolate overflow-hidden bg-black text-white select-none ${className}`}
      tabIndex={full ? 0 : -1}
      onKeyDown={onKeyDown}
      onMouseMove={() => full && setControlsVisible(true)}
      aria-label={full ? `${title}: 360° player. Drag or use arrow keys to look around, space to play or pause.` : undefined}
      role={full ? "application" : undefined}
    >
      {/* Poster stays underneath until the scene is ready (and for files until playback starts). */}
      {poster && (!ready || (!isGenerated && !started)) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div ref={canvasHostRef} className={`absolute inset-0 transition-opacity duration-700 ${ready && (isGenerated || started) ? "opacity-100" : "opacity-0"}`} />

      {!ready && !error && mode !== "capture" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex items-center gap-3 rounded-full bg-black/55 px-4 py-2 text-sm backdrop-blur">
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-[var(--gold)]" />
            Preparing 360° view…
          </div>
        </div>
      )}
      {buffering && playing && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="size-10 animate-spin rounded-full border-4 border-white/25 border-t-[var(--gold)]" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center">
          <p className="max-w-sm text-sm text-white/90">{error}</p>
        </div>
      )}

      {full && ready && !error && (
        <>
          {isGenerated && (
            <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] tracking-wide text-white/80 uppercase backdrop-blur">
              Placeholder scene
            </span>
          )}

          {resumedAt !== null && (
            <div className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/65 px-4 py-1.5 text-sm backdrop-blur">
              Resumed at {formatDuration(resumedAt)}
              <button className="font-medium text-[var(--gold-strong)] hover:underline" onClick={() => { seek(0); setResumedAt(null); }}>
                Start over
              </button>
            </div>
          )}

          {(!started || ended) && (
            <button
              onClick={ended ? () => { seek(0); play(); } : play}
              className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur transition hover:scale-105 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-[var(--gold)]"
              aria-label={ended ? "Replay" : "Play"}
            >
              <Icon name={ended ? "replay" : "play"} size={34} className="text-[var(--gold-strong)]" />
            </button>
          )}

          {hint && !started && (
            <div className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-sm whitespace-nowrap backdrop-blur">
              <Icon name="drag" size={16} /> Drag to look around<span className="hidden sm:inline"> · Scroll to zoom</span>
            </div>
          )}

          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-12 pb-2 transition-opacity duration-300 sm:px-4 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={current}
              onChange={(ev) => seek(Number(ev.target.value))}
              aria-label="Seek"
              aria-valuetext={`${formatDuration(current)} of ${formatDuration(duration)}`}
              className="player-range mb-1.5 w-full"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
            <div className="flex items-center gap-1 sm:gap-2">
              <CtrlButton label={playing ? "Pause (k)" : "Play (k)"} onClick={togglePlay} icon={playing ? "pause" : "play"} />
              {!isGenerated && (
                <div className="group/vol flex items-center">
                  <CtrlButton label={muted ? "Unmute (m)" : "Mute (m)"} onClick={toggleMute} icon={muted || volume === 0 ? "mute" : "volume"} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(ev) => changeVolume(Number(ev.target.value))}
                    aria-label="Volume"
                    className="player-range hidden w-20 sm:block"
                    style={{ "--progress": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                  />
                </div>
              )}
              <span className="ml-1 text-xs text-white/85 tabular-nums sm:text-sm">
                {formatDuration(current)} <span className="text-white/50">/ {formatDuration(duration)}</span>
              </span>
              <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                <CtrlButton label="Zoom out (-)" onClick={() => zoom(10)} icon="zoomOut" className="hidden sm:grid" />
                <CtrlButton label="Zoom in (+)" onClick={() => zoom(-10)} icon="zoomIn" className="hidden sm:grid" />
                <CtrlButton label="Recenter view (r)" onClick={recenter} icon="recenter" />
                {gyroAvailable && <CtrlButton label={gyroOn ? "Turn off motion control" : "Look around by moving your phone"} onClick={toggleGyro} icon="gyro" active={gyroOn} />}
                {xrSupported && (
                  <button
                    onClick={enterVR}
                    disabled={inXR}
                    className="ml-1 flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--gold-strong)]"
                  >
                    <Icon name="headset" size={18} /> Enter VR
                  </button>
                )}
                <CtrlButton label={isFullscreen ? "Exit full screen (f)" : "Full screen (f)"} onClick={toggleFullscreen} icon={isFullscreen ? "exitFullscreen" : "fullscreen"} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CtrlButton({
  label,
  onClick,
  icon,
  active,
  className = "",
}: {
  label: string;
  onClick: () => void;
  icon: Parameters<typeof Icon>[0]["name"];
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`grid size-9 place-items-center rounded-full transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[var(--gold)] ${active ? "bg-white/20 text-[var(--gold-strong)]" : ""} ${className}`}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
