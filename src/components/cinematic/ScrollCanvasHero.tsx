"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { animate } from "animejs";
import SplitType from "split-type";
import { brand } from "@/data/content";
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
const PRELOAD = 24;

function supportsAvif() {
  // Prefer WebP on mobile/slow for faster decode; AVIF on desktop when supported.
  if (typeof window === "undefined") return false;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (mobile) return false;
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

export function ScrollCanvasHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const targetFrame = useRef(0);
  const drawFrame = useRef(0);
  const frames = useRef<(ImageBitmap | null)[]>([]);
  const rafDraw = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);

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
    workerRef.current = worker;

    // Begin scrubbing from first meaningful frame (skip cream void)
    targetFrame.current = startFrame;
    drawFrame.current = startFrame;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
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

      // Never leave a blank/white canvas
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
      for (let d = 0; d <= 10; d++) {
        const a = center + d;
        const b = center - d;
        if (a < manifest.total && !frames.current[a]) indices.push(a);
        if (d > 0 && b >= 0 && !frames.current[b]) indices.push(b);
      }
      if (!indices.length) return;
      worker.postMessage({
        type: "WARM",
        indices: indices.slice(0, 16),
        basePath: manifest.basePath,
        pad: manifest.pad,
        preferAvif,
      } satisfies WorkerRequest);
    };

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;
      if (msg.type === "FRAME") {
        const prev = frames.current[msg.index];
        if (prev) prev.close();
        frames.current[msg.index] = msg.bitmap;
        loadedCount += 1;
        setProgress(Math.round((loadedCount / manifest.total) * 100));
        if (msg.index === startFrame || loadedCount === 1) setReady(true);
        const ideal = Math.round(drawFrame.current);
        if (Math.abs(msg.index - ideal) <= 2) scheduleDraw();
        if (loadedCount >= Math.min(12, span + 1)) {
          ScrollTrigger.refresh();
        }
      }
    };

    // Priority: start from first meaningful frame
    const warmIndices = Array.from(
      { length: Math.min(PRELOAD, span + 1) },
      (_, i) => startFrame + i,
    );
    worker.postMessage({
      type: "WARM",
      indices: warmIndices,
      basePath: manifest.basePath,
      pad: manifest.pad,
      preferAvif,
    } satisfies WorkerRequest);

    // Then stream the rest in parallel batches (from startFrame)
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

    // Kick several batches immediately for fluidity
    loadNextBatch();
    loadNextBatch();
    loadNextBatch();
    const batchTimer = window.setInterval(() => {
      if (loadedBatch >= totalBatches) {
        window.clearInterval(batchTimer);
        return;
      }
      loadNextBatch();
    }, 90);

    const onResize = () => scheduleDraw();
    window.addEventListener("resize", onResize);

    // Smooth display frame toward scroll target (prevents stutter)
    let ticking = true;
    const smoothLoop = () => {
      if (!ticking) return;
      const diff = targetFrame.current - drawFrame.current;
      if (Math.abs(diff) > 0.01) {
        drawFrame.current += diff * 0.28;
        scheduleDraw();
      } else if (drawFrame.current !== targetFrame.current) {
        drawFrame.current = targetFrame.current;
        scheduleDraw();
      }
      requestAnimationFrame(smoothLoop);
    };
    requestAnimationFrame(smoothLoop);

    (
      sectionRef.current as HTMLElement & {
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
      workerRef.current = null;
      frames.current.forEach((b) => b?.close());
    };
  }, [manifest, reduced]);

  useGSAP(
    () => {
      if (!manifest || reduced || !sectionRef.current) return;

      const section = sectionRef.current;
      const overlay = overlayRef.current;
      if (!overlay) return;

      const eyebrow = overlay.querySelector(".cine-eyebrow");
      const script = overlay.querySelector(".cine-script");
      const title = overlay.querySelector(".cine-title");
      const sub = overlay.querySelector(".cine-sub");
      const ctas = overlay.querySelector(".cine-ctas");
      const quote = overlay.querySelector(".cine-quote");

      // Keep brand copy always readable — never start at opacity 0 (was causing blank hero)
      const splits: SplitType[] = [];
      [eyebrow, script, title].forEach((el) => {
        if (!el) return;
        splits.push(new SplitType(el as HTMLElement, { types: "chars" }));
      });

      gsap.fromTo(
        overlay.querySelectorAll(".char"),
        { y: 18, opacity: 0.35 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.012,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo(
        [sub, quote, ctas].filter(Boolean),
        { y: 16, opacity: 0.4 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.25,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );

      const pinEnd =
        typeof window !== "undefined" && window.innerWidth < 768
          ? Math.max(280, Math.round(manifest.scrollPinVh * 0.7))
          : manifest.scrollPinVh;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${pinEnd}%`,
        pin: true,
        scrub: 0.35,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const start = Math.min(
            Math.max(0, manifest.startFrame ?? 0),
            Math.max(0, manifest.total - 1),
          );
          const end = manifest.total - 1;
          const idx = Math.round(start + self.progress * (end - start));
          (
            section as HTMLElement & { __setFrame?: (i: number) => void }
          ).__setFrame?.(Math.min(end, Math.max(start, idx)));
        },
        onLeave: () => ScrollTrigger.refresh(),
      });

      const pulse = animate(".cine-scroll-hint", {
        opacity: [0.35, 0.9, 0.35],
        translateY: [0, 6, 0],
        ease: "inOut(2)",
        duration: 2200,
        loop: true,
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
      const refreshLater = window.setTimeout(() => ScrollTrigger.refresh(), 800);

      return () => {
        window.clearTimeout(refreshLater);
        pulse.pause();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: sectionRef, dependencies: [manifest, reduced] },
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
          <p className="script mt-4 text-4xl text-[var(--gold)]">cuidado</p>
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
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden bg-[var(--nude)]"
      aria-label="Experiência cinematográfica Lívia Sodré"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full will-change-transform"
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(250,246,240,0.78)] via-[rgba(250,246,240,0.22)] to-transparent md:via-[rgba(250,246,240,0.12)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(31,22,18,0.42)] via-transparent to-[rgba(250,246,240,0.15)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[rgba(250,246,240,0.45)] to-transparent" />

      {progress < 100 && (
        <div className="pointer-events-none absolute right-5 top-24 z-20 md:right-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
            {progress}%
          </p>
        </div>
      )}

      <div
        ref={overlayRef}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24"
      >
        <div className="max-w-xl pointer-events-auto md:max-w-2xl">
          <p className="cine-eyebrow eyebrow text-[var(--gold-dim)]">
            {brand.subtitle}
          </p>
          <p className="cine-script script mt-6 text-[clamp(2.6rem,8vw,4.6rem)] text-[var(--gold)] drop-shadow-[0_8px_30px_rgba(44,31,26,0.12)]">
            cuidado
          </p>
          <p className="cine-quote mt-5 max-w-md text-sm leading-relaxed text-[var(--brown)] md:text-base">
            Aqui você é cuidada por quem realmente faz a diferença.
          </p>
          <h1 className="cine-title display mt-8 text-[clamp(2.8rem,7.5vw,5.6rem)] leading-[0.9] text-[var(--chocolate)]">
            {brand.name}
          </h1>
          <p className="cine-sub mt-4 max-w-lg text-[var(--muted)] leading-relaxed">
            {brand.tagline}
          </p>
          <div className="cine-ctas mt-8 flex flex-wrap gap-3">
            <Link href="/agendar" className="btn-primary">
              Agendar agora
            </Link>
            <Link href="#servicos" className="btn-ghost">
              Ver serviços
            </Link>
          </div>
        </div>
      </div>

      <div className="cine-scroll-hint pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="text-[10px] tracking-[0.28em] uppercase text-[var(--muted)]">
          Scroll
        </p>
        <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[var(--gold)] to-transparent" />
      </div>
    </section>
  );
}
