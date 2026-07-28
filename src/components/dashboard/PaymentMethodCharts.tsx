"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/data/services";
import { IconBubble } from "@/components/ui/IconBubble";
import { CreditCard } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type PaymentMethodStat = {
  method: string;
  total: number;
  count: number;
  color: string;
};

export const paymentMethodMock: PaymentMethodStat[] = [
  { method: "PIX", total: 9840, count: 28, color: "#22c55e" },
  { method: "Cartão", total: 7650, count: 22, color: "#3b82f6" },
  { method: "Dinheiro", total: 2180, count: 14, color: "#b8956a" },
  { method: "Transferência", total: 1750, count: 8, color: "#8b5cf6" },
];

const weeklyByMethod = [
  { label: "Sem 1", PIX: 1800, Cartão: 1400, Dinheiro: 420, Transferência: 300 },
  { label: "Sem 2", PIX: 2100, Cartão: 1650, Dinheiro: 510, Transferência: 380 },
  { label: "Sem 3", PIX: 2450, Cartão: 1980, Dinheiro: 580, Transferência: 450 },
  { label: "Sem 4", PIX: 3490, Cartão: 2620, Dinheiro: 670, Transferência: 620 },
];

function DonutChart({ data }: { data: PaymentMethodStat[] }) {
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="rgba(44,31,26,0.06)"
            strokeWidth="18"
          />
          {data.map((d, i) => {
            const len = (d.total / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <motion.circle
                key={d.method}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[9px] uppercase tracking-wide text-[var(--muted)]">Total</p>
          <p className="display text-sm text-[var(--chocolate)]">
            {formatPrice(total)}
          </p>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.method} className="flex items-center justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: d.color }}
              />
              {d.method}
            </span>
            <span className="text-[var(--gold-dim)]">
              {Math.round((d.total / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MethodBars({ data }: { data: PaymentMethodStat[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex h-44 items-stretch gap-3">
      {data.map((d, i) => {
        const pct = Math.max(10, Math.round((d.total / max) * 100));
        return (
          <div key={d.method} className="group flex min-w-0 flex-1 flex-col items-center">
            <p className="mb-1 truncate text-[9px] text-[var(--muted)] opacity-0 transition group-hover:opacity-100">
              {formatPrice(d.total)}
            </p>
            <div className="flex w-full flex-1 items-end justify-center">
              <motion.div
                className="w-full max-w-[48px] rounded-t-lg"
                style={{ background: `linear-gradient(180deg, ${d.color}, ${d.color}99)` }}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: 0.08 * i, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-[10px] tracking-[0.1em] uppercase text-[var(--muted)]">
              {d.method}
            </p>
            <p className="text-[9px] text-[var(--muted)]">{d.count} tx</p>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyStacked({ data }: { data: PaymentMethodStat[] }) {
  const keys = data.map((d) => d.method);
  const colors = Object.fromEntries(data.map((d) => [d.method, d.color]));
  const max = Math.max(
    ...weeklyByMethod.map((w) =>
      keys.reduce((s, k) => s + Number((w as Record<string, string | number>)[k] || 0), 0),
    ),
    1,
  );

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-3 sm:gap-4">
        {weeklyByMethod.map((week, wi) => {
          const values = keys.map((k) => Number((week as Record<string, string | number>)[k] || 0));
          const sum = values.reduce((a, b) => a + b, 0);
          return (
            <div key={week.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-t-lg"
                style={{ height: `${Math.max(12, (sum / max) * 100)}%` }}
              >
                {keys.map((k, ki) => {
                  const v = values[ki];
                  const h = sum ? (v / sum) * 100 : 0;
                  return (
                    <motion.div
                      key={k}
                      title={`${week.label} · ${k}: ${formatPrice(v)}`}
                      style={{ background: colors[k], height: `${h}%` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * wi + 0.03 * ki }}
                      className="w-full"
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
                {week.label}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {data.map((d) => (
          <span
            key={d.method}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[var(--muted)]"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            {d.method}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PaymentMethodCharts({
  data,
  className,
}: {
  data?: PaymentMethodStat[];
  className?: string;
}) {
  const series =
    data && data.length
      ? data.map((d, i) => ({
          ...d,
          color:
            d.color ||
            paymentMethodMock[i % paymentMethodMock.length]?.color ||
            "#b8956a",
        }))
      : paymentMethodMock;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div className="dash-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <IconBubble icon={CreditCard} tone="soft" size={16} />
          <div>
            <h3 className="display text-xl text-[var(--chocolate)]">
              Distribuição
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Por método · mock
            </p>
          </div>
        </div>
        <DonutChart data={series} />
      </div>

      <div className="dash-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <IconBubble icon={CreditCard} tone="soft" size={16} />
          <div>
            <h3 className="display text-xl text-[var(--chocolate)]">
              Receita por método
            </h3>
            <p className="text-xs text-[var(--muted)]">Comparativo · mock</p>
          </div>
        </div>
        <MethodBars data={series} />
      </div>

      <div className="dash-card p-5 md:col-span-2">
        <div className="mb-4 flex items-center gap-3">
          <IconBubble icon={CreditCard} tone="soft" size={16} />
          <div>
            <h3 className="display text-xl text-[var(--chocolate)]">
              Evolução semanal por método
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Empilhado · últimos 4 semanas · mock
            </p>
          </div>
        </div>
        <WeeklyStacked data={series} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {series.map((d) => (
            <div
              key={d.method}
              className="rounded-xl border border-white/45 bg-white/40 px-3 py-3"
              style={{ borderLeft: `3px solid ${d.color}` }}
            >
              <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {d.method}
              </p>
              <p className="display mt-1 text-lg text-[var(--chocolate)]">
                {formatPrice(d.total)}
              </p>
              <p className="text-xs text-[var(--muted)]">{d.count} transações</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
