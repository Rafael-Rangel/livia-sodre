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
};

const BATCH = 12;

function supportsAvif() {
  try {
    const c = document.createElement("canvas");
    return c.toDataURL("image/avif").startsWith("data:image/avif");
  } catch {
    return false;
  }
}

export function ScrollCanvasHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameIndex = useRef(0);
  const frames = useRef<(ImageBitmap | null)[]>([]);
  const rafDraw = useRef(0);
  const [ready, setReady] = useState(false);
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
    frames.current = Array.from({ length: manifest.total }, () => null);

    const worker = new Worker(
      new URL("../../workers/frame-loader.worker.ts", import.meta.url),
    );

    const draw = () => {
      const canvas = canvasRef.current;
      const bmp = frames.current[frameIndex.current];
      if (!canvas || !bmp) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.max(w / bmp.width, h / bmp.height);
      const dw = bmp.width * scale;
      const dh = bmp.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.fillStyle = "#f0e6d8";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bmp, dx, dy, dw, dh);
    };

    const scheduleDraw = () => {
      cancelAnimationFrame(rafDraw.current);
      rafDraw.current = requestAnimationFrame(draw);
    };

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;
      if (msg.type === "FRAME") {
        const prev = frames.current[msg.index];
        if (prev) prev.close();
        frames.current[msg.index] = msg.bitmap;
        if (msg.index === frameIndex.current) scheduleDraw();
        if (msg.index === 0) setReady(true);
      }
    };

    const warmFirst = Array.from({ length: Math.min(8, manifest.total) }, (_, i) => i);
    worker.postMessage({
      type: "WARM",
      indices: warmFirst,
      basePath: manifest.basePath,
      pad: manifest.pad,
      preferAvif,
    } satisfies WorkerRequest);

    let loadedBatch = 0;
    const loadNextBatch = () => {
      const start = loadedBatch * BATCH;
      if (start >= manifest.total) return;
      const end = Math.min(manifest.total - 1, start + BATCH - 1);
      worker.postMessage({
        type: "LOAD_RANGE",
        start,
        end,
        basePath: manifest.basePath,
        pad: manifest.pad,
        preferAvif,
      } satisfies WorkerRequest);
      loadedBatch += 1;
    };

    loadNextBatch();
    const batchTimer = window.setInterval(() => {
      if (loadedBatch * BATCH >= manifest.total) {
        window.clearInterval(batchTimer);
        return;
      }
      loadNextBatch();
    }, 180);

    const onResize = () => scheduleDraw();
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadNextBatch();
      },
      { rootMargin: "200px" },
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    (sectionRef.current as HTMLElement & { __setFrame?: (i: number) => void }).__setFrame = (
      i: number,
    ) => {
      frameIndex.current = i;
      scheduleDraw();
      const ahead = Math.min(manifest.total - 1, i + 6);
      if (!frames.current[ahead]) {
        worker.postMessage({
          type: "WARM",
          indices: [ahead],
          basePath: manifest.basePath,
          pad: manifest.pad,
          preferAvif,
        } satisfies WorkerRequest);
      }
    };

    return () => {
      window.clearInterval(batchTimer);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafDraw.current);
      io.disconnect();
      worker.terminate();
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

      const splits: SplitType[] = [];
      [eyebrow, script, title, sub, quote].forEach((el) => {
        if (!el) return;
        splits.push(new SplitType(el as HTMLElement, { types: "words,chars" }));
      });

      gsap.set(".cine-char, .cine-word, .char, .word", { opacity: 0, y: 28 });
      gsap.set([script, quote, title, sub, ctas], { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${manifest.scrollPinVh}%`,
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              manifest.total - 1,
              Math.floor(self.progress * (manifest.total - 1)),
            );
            (
              section as HTMLElement & { __setFrame?: (i: number) => void }
            ).__setFrame?.(idx);
          },
        },
      });

      tl.to({}, { duration: 0.08 })
        .to(
          eyebrow?.querySelectorAll(".char, .word") || [],
          { opacity: 1, y: 0, stagger: 0.015, duration: 0.12, ease: "power2.out" },
          0.08,
        )
        .to(script, { opacity: 1, duration: 0.01 }, 0.28)
        .to(
          script?.querySelectorAll(".char, .word") || [],
          { opacity: 1, y: 0, stagger: 0.02, duration: 0.14, ease: "power2.out" },
          0.28,
        )
        .to(quote, { opacity: 1, duration: 0.01 }, 0.5)
        .to(
          quote?.querySelectorAll(".char, .word") || [],
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.12 },
          0.5,
        )
        .to([title, sub], { opacity: 1, duration: 0.01 }, 0.78)
        .to(
          title?.querySelectorAll(".char, .word") || [],
          { opacity: 1, y: 0, stagger: 0.018, duration: 0.16, ease: "power3.out" },
          0.78,
        )
        .to(
          sub?.querySelectorAll(".char, .word") || [],
          { opacity: 1, y: 0, stagger: 0.01, duration: 0.12 },
          0.86,
        )
        .to(ctas, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.92);

      const pulse = animate(".cine-scroll-hint", {
        opacity: [0.35, 0.9, 0.35],
        translateY: [0, 6, 0],
        ease: "inOut(2)",
        duration: 2200,
        loop: true,
      });

      return () => {
        pulse.pause();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: sectionRef, dependencies: [manifest, reduced, ready] },
  );

  if (reduced) {
    return (
      <section className="texture relative flex min-h-[100svh] items-end px-5 pb-16 pt-28 md:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cinematic/frames/frame-095.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="eyebrow">{brand.subtitle}</p>
          <h1 className="display mt-4 text-5xl text-[var(--chocolate)] md:text-7xl">
            {brand.name}
          </h1>
          <p className="script mt-4 text-4xl text-[var(--gold)]">Beleza que transforma</p>
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(250,246,240,0.72)] via-[rgba(250,246,240,0.28)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(44,31,26,0.35)] via-transparent to-[rgba(250,246,240,0.2)]" />

      <div
        ref={overlayRef}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24"
      >
        <div className="max-w-xl pointer-events-auto">
          <p className="cine-eyebrow eyebrow text-[var(--gold-dim)]">
            {brand.subtitle}
          </p>
          <p className="cine-script script mt-6 text-[clamp(2.4rem,7vw,4.2rem)] text-[var(--gold)]">
            cuidado
          </p>
          <p className="cine-quote mt-5 max-w-md text-sm leading-relaxed text-[var(--brown)] md:text-base">
            Aqui você é cuidada por quem realmente faz a diferença.
          </p>
          <h1 className="cine-title display mt-8 text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.92] text-[var(--chocolate)]">
            {brand.name}
          </h1>
          <p className="cine-sub mt-4 max-w-md text-[var(--muted)] leading-relaxed">
            {brand.tagline}
          </p>
          <div className="cine-ctas mt-8 flex flex-wrap gap-3 opacity-0">
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
