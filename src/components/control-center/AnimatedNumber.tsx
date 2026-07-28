"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { formatPrice } from "@/data/services";

export function AnimatedNumber({
  value,
  format = "number",
  className,
}: {
  value: number;
  format?: "number" | "currency" | "percent" | "minutes";
  className?: string;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  const first = useRef(true);

  useMotionValueEvent(mv, "change", (v) => {
    const n = Math.round(v);
    if (format === "currency") setDisplay(formatPrice(n));
    else if (format === "percent") setDisplay(`${n}%`);
    else if (format === "minutes") setDisplay(`${n} min`);
    else setDisplay(n.toLocaleString("pt-BR"));
  });

  useEffect(() => {
    const from = first.current ? 0 : mv.get();
    first.current = false;
    const ctrl = animate(mv, value, {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [value, mv]);

  return <span className={className}>{display}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gradient-to-r from-black/[0.04] via-black/[0.08] to-black/[0.04] ${className || "h-24"}`}
    />
  );
}
