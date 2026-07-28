"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { statusIcons } from "@/lib/icons";

export function DashReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function DashCard({
  children,
  className,
  delay = 0,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  dark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn("dash-card", dark && "dash-card-dark", className)}
    >
      {children}
    </motion.div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "dash-pill-pending",
    scheduled: "dash-pill-pending",
    confirmed: "dash-pill-ok",
    in_progress: "dash-pill-ok",
    completed: "dash-pill-done",
    finished: "dash-pill-done",
    cancelled: "dash-pill-cancel",
    no_show: "dash-pill-cancel",
    rescheduled: "dash-pill-pending",
    paid: "dash-pill-ok",
    refunded: "dash-pill-cancel",
  };
  const Icon = statusIcons[status];
  return (
    <span className={cn("dash-pill", map[status] || "dash-pill-pending")}>
      {Icon && <Icon size={11} strokeWidth={2} aria-hidden />}
      {status}
    </span>
  );
}
