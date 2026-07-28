"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/data/services";
import { monthlyInsights } from "@/data/dashboard-mock";
import { cn } from "@/lib/utils";

type Point = { monthLabel: string; revenue: number; appointments?: number };

export function MonthlyRevenueChart({
  data = monthlyInsights,
  className,
  height = 180,
}: {
  data?: Point[];
  className?: string;
  height?: number;
}) {
  const series = data.length
    ? data
    : [
        { monthLabel: "Fev", revenue: 12800 },
        { monthLabel: "Mar", revenue: 15240 },
        { monthLabel: "Abr", revenue: 14110 },
        { monthLabel: "Mai", revenue: 17890 },
        { monthLabel: "Jun", revenue: 19650 },
        { monthLabel: "Jul", revenue: 21420 },
      ];

  const max = Math.max(...series.map((m) => m.revenue), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h3 className="display text-xl text-[var(--chocolate)]">Receita mensal</h3>
          <p className="text-xs text-[var(--muted)]">Últimos 6 meses · mock</p>
        </div>
        <p className="display text-lg text-[var(--gold-dim)]">
          {formatPrice(series[series.length - 1]?.revenue || 0)}
        </p>
      </div>

      <div
        className="flex items-stretch gap-2 sm:gap-3"
        style={{ height }}
        role="img"
        aria-label="Gráfico de receita mensal"
      >
        {series.map((m, i) => {
          const pct = Math.max(8, Math.round((m.revenue / max) * 100));
          return (
            <div
              key={m.monthLabel}
              className="group flex min-w-0 flex-1 flex-col items-center"
            >
              <p className="mb-1 truncate text-[9px] text-[var(--muted)] opacity-0 transition group-hover:opacity-100 sm:text-[10px]">
                {formatPrice(m.revenue)}
              </p>
              <div className="relative flex w-full flex-1 items-end justify-center">
                <motion.div
                  className="w-full max-w-[52px] rounded-t-lg bg-gradient-to-t from-[var(--gold-dim)] to-[var(--gold-bright)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{
                    delay: 0.08 * i,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ filter: "brightness(1.08)" }}
                  title={`${m.monthLabel}: ${formatPrice(m.revenue)}`}
                />
              </div>
              <p className="mt-2 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)]">
                {m.monthLabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
