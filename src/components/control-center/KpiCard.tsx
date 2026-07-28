"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "@/lib/utils";

const tones = {
  default: "text-[var(--chocolate)]",
  success: "text-[#3f6b48]",
  warn: "text-[#92400e]",
  danger: "text-[#8a3030]",
  info: "text-[#1d4ed8]",
};

export function KpiCard({
  label,
  value,
  format,
  hint,
  tone = "default",
  icon: Icon,
  delta,
  delay = 0,
  onClick,
}: {
  label: string;
  value: number;
  format: "number" | "currency" | "percent" | "minutes";
  hint: string;
  tone?: keyof typeof tones;
  icon?: LucideIcon;
  delta?: number;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      title={hint}
      onClick={onClick}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="cc-card group relative w-full overflow-hidden p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--muted)]">
          {label}
        </p>
        {Icon && (
          <span className="rounded-lg bg-white/50 p-1.5 text-[var(--gold-dim)] transition group-hover:scale-110">
            <Icon size={14} strokeWidth={1.7} />
          </span>
        )}
      </div>
      <AnimatedNumber
        value={value}
        format={format}
        className={cn("display mt-2 block text-2xl md:text-3xl", tones[tone])}
      />
      {delta != null && (
        <p className="mt-1 text-[10px] text-[var(--gold-dim)]">
          {delta > 0 ? "+" : ""}
          {delta}% vs semana
        </p>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold-bright)] transition duration-300 group-hover:scale-x-100" />
    </motion.button>
  );
}

export function WidgetShell({
  title,
  icon: Icon,
  children,
  className,
  actions,
  delay = 0,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("cc-card p-4 md:p-5", className)}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="display flex items-center gap-2.5 text-xl text-[var(--chocolate)]">
          {Icon && (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,149,106,0.16)] text-[var(--gold-dim)]">
              <Icon size={16} strokeWidth={1.7} />
            </span>
          )}
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </motion.section>
  );
}
