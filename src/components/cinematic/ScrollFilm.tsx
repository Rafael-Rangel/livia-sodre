"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { brand } from "@/data/content";
import { activeBeat, type StoryBeat } from "@/data/scroll-story";
import type { WorkerRequest, WorkerResponse } from "@/workers/frame-loader.worker";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Manifest = {
  total: number;
  pad: number;
  width: number;
  height: number;
  formats: string[];
  basePath: string;
  poster: string;
  scrollPinVh: number;
  startFrame?: number;
};

const BATCH = 16;
const PRELOAD = 20;

function supportsAvif() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(max-width: 768px)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return c.toDataURL("image/avif").startsWith("data:image/avif");
  } catch {
    return false;
  }
}

function nearestLoaded(
  frames: Array<ImageBitmap | null>,
  target: number,
): number {
  if (frames[target]) return target;
  for (let d = 1; d < frames.length; d++) {
    const prev = target - d;
    const next = target + d;
    if (prev >= 0 && frames[prev]) return prev;
    if (next < frames.length && frames[next]) return next;
  }
  return -1;
}

/**
 * Full-page scroll film: videos are never played.
 * Frames advance strictly with scroll progress (Apple / Tesla style).
 */
export function ScrollFilm() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetFrame = useRef(0);
  const drawFrame = useRef(0);
  const frames = useRef<(ImageBitmap | null)[]>([]);
  const rafDraw = useRef(0);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [beat, setBeat] = useState<StoryBeat>(() => activeBeat(0));
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    fetch("/cinematic/manifest.json")
      .then((r) => r.json())
      .then((m: Manifest) => setManifest(m))
      .catch(() => setManifest(null));
  }, []);

  useEffect(() => {
    if (!manifest || reduced) return;

    const preferAvif = supportsAvif() && manifest.formats.includes("avif");
    const startFrame = Math.min(
      Math.max(0, manifest.startFrame ?? 0),
      Math.max(0, manifest.total - 1),
    );
    const lastFrame = manifest.total - 1;
    const span = Math.max(1, lastFrame - startFrame);

    frames.current = Array.from({ length: manifest.total }, () => null);
    let loadedCount = 0;
    let lastDrawn = -1;

    const worker = new Worker(
      new URL("../../workers/frame-loader.worker.ts", import.meta.url),
    );

    targetFrame.current = startFrame;
    drawFrame.current = startFrame;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const tw = Math.floor(w * dpr);
      const th = Math.floor(h * dpr);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ede4d6";
      ctx.fillRect(0, 0, w, h);

      const ideal = Math.round(drawFrame.current);
      let idx = nearestLoaded(frames.current, ideal);
      if (idx < 0 && lastDrawn >= 0) idx = lastDrawn;
      if (idx < 0) return;
      const bmp = frames.current[idx];
      if (!bmp) return;
      lastDrawn = idx;

      const scale = Math.max(w / bmp.width, h / bmp.height);
      const dw = bmp.width * scale;
      const dh = bmp.height * scale;
      ctx.drawImage(bmp, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(rafDraw.current);
      rafDraw.current = requestAnimationFrame(draw);
    };

    const warmAround = (center: number) => {
      const indices: number[] = [];
      for (let d = 0; d <= 12; d++) {
        const a = center + d;
        const b = center - d;
        if (a < manifest.total && !frames.current[a]) indices.push(a);
        if (d > 0 && b >= 0 && !frames.current[b]) indices.push(b);
      }
      if (!indices.length) return;
      worker.postMessage({
        type: "WARM",
        indices: indices.slice(0, 18),
        basePath: manifest.basePath,
        pad: manifest.pad,
        preferAvif,
      } satisfies WorkerRequest);
    };

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;
      if (msg.type !== "FRAME") return;
      const prev = frames.current[msg.index];
      if (prev) prev.close();
      frames.current[msg.index] = msg.bitmap;
      loadedCount += 1;
      setLoadPct(Math.round((loadedCount / manifest.total) * 100));
      if (msg.index === startFrame || loadedCount === 1) setReady(true);
      const ideal = Math.round(drawFrame.current);
      if (Math.abs(msg.index - ideal) <= 2) scheduleDraw();
      if (loadedCount >= Math.min(12, span + 1)) ScrollTrigger.refresh();
    };

    worker.postMessage({
      type: "WARM",
      indices: Array.from(
        { length: Math.min(PRELOAD, span + 1) },
        (_, i) => startFrame + i,
      ),
      basePath: manifest.basePath,
      pad: manifest.pad,
      preferAvif,
    } satisfies WorkerRequest);

    let loadedBatch = 0;
    const totalBatches = Math.ceil((span + 1) / BATCH);
    const loadNextBatch = () => {
      if (loadedBatch >= totalBatches) return;
      const start = startFrame + loadedBatch * BATCH;
      const end = Math.min(lastFrame, start + BATCH - 1);
      worker.postMessage({
        type: "LOAD_RANGE",
        start,
        end,
        basePath: manifest.basePath,
        pad: manifest.pad,
        preferAvif,
        concurrency: 8,
      } satisfies WorkerRequest);
      loadedBatch += 1;
    };
    loadNextBatch();
    loadNextBatch();
    loadNextBatch();
    const batchTimer = window.setInterval(() => {
      if (loadedBatch >= totalBatches) {
        window.clearInterval(batchTimer);
        return;
      }
      loadNextBatch();
    }, 100);

    const onResize = () => scheduleDraw();
    window.addEventListener("resize", onResize);

    let ticking = true;
    const smoothLoop = () => {
      if (!ticking) return;
      const diff = targetFrame.current - drawFrame.current;
      if (Math.abs(diff) > 0.01) {
        drawFrame.current += diff * 0.32;
        scheduleDraw();
      } else if (drawFrame.current !== targetFrame.current) {
        drawFrame.current = targetFrame.current;
        scheduleDraw();
      }
      requestAnimationFrame(smoothLoop);
    };
    requestAnimationFrame(smoothLoop);

    (
      rootRef.current as HTMLElement & {
        __setFrame?: (i: number) => void;
      }
    ).__setFrame = (i: number) => {
      targetFrame.current = i;
      warmAround(i);
    };

    return () => {
      ticking = false;
      window.clearInterval(batchTimer);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafDraw.current);
      worker.terminate();
      frames.current.forEach((b) => b?.close());
    };
  }, [manifest, reduced]);

  useGSAP(
    () => {
      if (!manifest || reduced || !rootRef.current) return;

      const start = Math.min(
        Math.max(0, manifest.startFrame ?? 0),
        Math.max(0, manifest.total - 1),
      );
      const end = manifest.total - 1;
      const pinEnd =
        window.innerWidth < 768
          ? Math.max(320, Math.round(manifest.scrollPinVh * 0.75))
          : manifest.scrollPinVh;

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: `+=${pinEnd}%`,
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.round(start + p * (end - start));
          (
            rootRef.current as HTMLElement & {
              __setFrame?: (i: number) => void;
            }
          )?.__setFrame?.(Math.min(end, Math.max(start, idx)));
          setStoryProgress(p);
          setBeat(activeBeat(p));
        },
        onLeave: () => ScrollTrigger.refresh(),
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 900);
      return () => window.clearTimeout(t);
    },
    { scope: rootRef, dependencies: [manifest, reduced] },
  );

  if (reduced) {
    return (
      <section className="texture relative flex min-h-[100svh] items-end px-5 pb-16 pt-28 md:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cinematic/frames/frame-060.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="eyebrow">{brand.subtitle}</p>
          <h1 className="display mt-4 text-5xl text-[var(--chocolate)] md:text-7xl">
            {brand.name}
          </h1>
          <p className="mt-4 max-w-lg text-[var(--muted)]">{brand.tagline}</p>
          <div className="mt-8 flex gap-3">
            <Link href="/agendar" className="btn-primary">
              Agendar agora
            </Link>
            <Link href="#servicos" className="btn-ghost">
              Ver serviços
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative h-[100svh] overflow-hidden bg-[var(--nude)]"
      aria-label="Filme interativo Lívia Sodré — controlado pelo scroll"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />

      {!ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={manifest?.poster || "/cinematic/frames/frame-000.webp"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(250,246,240,0.82)] via-[rgba(250,246,240,0.28)] to-transparent md:via-[rgba(250,246,240,0.14)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(31,22,18,0.45)] via-transparent to-[rgba(250,246,240,0.12)]" />

      {loadPct < 100 && (
        <div className="pointer-events-none absolute right-5 top-24 z-20 md:right-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
            {loadPct}%
          </p>
        </div>
      )}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24">
        <div
          key={beat.id}
          className="story-beat max-w-xl pointer-events-auto md:max-w-2xl"
          style={{
            animation: "storyBeatIn 0.55s ease both",
          }}
        >
          <p className="eyebrow text-[var(--gold-dim)]">{beat.eyebrow}</p>
          {beat.script ? (
            <p className="script mt-5 text-[clamp(2.4rem,7vw,4.4rem)] text-[var(--gold)]">
              {beat.script}
            </p>
          ) : null}
          {beat.id === "limiar" ? (
            <h1
              className="display mt-4 text-[clamp(2.6rem,6.5vw,5.2rem)] leading-[0.95] text-[var(--chocolate)]"
            >
              {beat.title}
            </h1>
          ) : (
            <h2
              className="display mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.95] text-[var(--chocolate)]"
            >
              {beat.title}
            </h2>
          )}
          <p className="mt-4 max-w-lg text-[var(--muted)] leading-relaxed md:text-base">
            {beat.body}
          </p>
          {beat.showCta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agendar" className="btn-primary">
                Agendar agora
              </Link>
              <Link href="#servicos" className="btn-ghost">
                Ver serviços
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-[rgba(44,31,26,0.12)]">
          <div
            className="h-full bg-[var(--gold)] transition-[width] duration-150"
            style={{ width: `${Math.round(storyProgress * 100)}%` }}
          />
        </div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[var(--muted)]">
          Scroll
        </p>
      </div>
    </section>
  );
}
