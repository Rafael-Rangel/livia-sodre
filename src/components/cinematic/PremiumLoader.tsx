"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { brand } from "@/data/content";

type LoaderDetail = { pct?: number; ready?: boolean };

/**
 * Tela de entrada premium - cobre o site até a hero estar pronta.
 */
export function PremiumLoader() {
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    const MIN_MS = reduced ? 400 : 1800;
    let filmReady = false;
    let filmPct = 0;
    let finished = false;

    document.documentElement.classList.add("ls-loading");

    const tryFinish = () => {
      if (finished) return;
      const elapsed = performance.now() - started;
      const warmEnough = filmPct >= 18 || filmReady;
      if (warmEnough && elapsed >= MIN_MS) {
        finished = true;
        setExit(true);
        window.setTimeout(() => {
          setVisible(false);
          document.documentElement.classList.remove("ls-loading");
          window.dispatchEvent(new CustomEvent("ls-loader-done"));
        }, reduced ? 200 : 700);
      }
    };

    const onLoader = (e: Event) => {
      const detail = (e as CustomEvent<LoaderDetail>).detail || {};
      if (typeof detail.pct === "number") {
        filmPct = detail.pct;
        setPct((p) => Math.max(p, Math.min(100, detail.pct!)));
      }
      if (detail.ready) filmReady = true;
      tryFinish();
    };

    const onLoad = () => {
      setPct((p) => Math.max(p, 12));
      tryFinish();
    };

    window.addEventListener("ls-loader", onLoader as EventListener);
    window.addEventListener("load", onLoad);

    // Soft fake progress while frames warm up
    const tick = window.setInterval(() => {
      setPct((p) => {
        if (p >= 88) return p;
        return Math.min(88, p + (reduced ? 8 : 1.2 + Math.random() * 1.8));
      });
      tryFinish();
    }, 120);

    // Safety: never block forever
    const safety = window.setTimeout(() => {
      filmReady = true;
      filmPct = 100;
      setPct(100);
      tryFinish();
    }, 9000);

    // Kick if film already posted
    tryFinish();

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(safety);
      window.removeEventListener("ls-loader", onLoader as EventListener);
      window.removeEventListener("load", onLoad);
      document.documentElement.classList.remove("ls-loading");
    };
  }, []);

  useEffect(() => {
    if (exit) setPct(100);
  }, [exit]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="site-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <div className="site-loader__glow" aria-hidden />
          <div className="site-loader__arch" aria-hidden />

          <motion.div
            className="site-loader__inner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="site-loader__mark"
              animate={
                exit
                  ? { scale: 1.06, opacity: 0.9 }
                  : { scale: [1, 1.04, 1], opacity: [0.92, 1, 0.92] }
              }
              transition={
                exit
                  ? { duration: 0.5 }
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <span className="display">{brand.monogram}</span>
            </motion.div>

            <p className="script site-loader__script">cuidado</p>
            <p className="site-loader__brand">{brand.name}</p>
            <p className="site-loader__hint">Preparando sua experiência</p>

            <div className="site-loader__bar" aria-hidden>
              <motion.span
                style={{ width: `${Math.round(pct)}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
            <p className="site-loader__pct">{Math.round(pct)}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
