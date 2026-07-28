"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashCard, DashReveal, StatusPill } from "@/components/dashboard/DashUI";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import {
  PaymentMethodCharts,
  paymentMethodMock,
  type PaymentMethodStat,
} from "@/components/dashboard/PaymentMethodCharts";
import { IconBubble } from "@/components/ui/IconBubble";
import { formatPrice } from "@/data/services";
import { Banknote, TrendingUp, Wallet } from "@/lib/icons";
import type { Appointment } from "@/lib/types";

type Props = {
  revenue: number;
  pendingAmount: number;
  ticket: number;
  paid: Appointment[];
  pending: Appointment[];
  methodBreakdown: { method: string; total: number; count: number }[];
};

export function FinanceiroClient({
  revenue,
  pendingAmount,
  ticket,
  paid,
  pending,
  methodBreakdown,
}: Props) {
  const colors = Object.fromEntries(
    paymentMethodMock.map((m) => [m.method, m.color]),
  );
  const methods: PaymentMethodStat[] =
    methodBreakdown.length > 0
      ? methodBreakdown.map((m) => ({
          ...m,
          color: colors[m.method] || "#b8956a",
        }))
      : paymentMethodMock;

  return (
    <>
      <DashReveal>
        <div className="flex items-center gap-3">
          <IconBubble icon={Wallet} tone="soft" />
          <p className="eyebrow">Financeiro</p>
        </div>
        <h1 className="display mt-2 text-4xl text-[var(--chocolate)] md:text-5xl">
          Caixa da clínica
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Recebimentos, pendências e canais de pagamento — demo com dados
          mockados.
        </p>
      </DashReveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashCard delay={0.05} dark className="p-6">
          <div className="flex items-start justify-between">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--gold-bright)]">
              Recebido
            </p>
            <IconBubble icon={Wallet} tone="cream" size={16} />
          </div>
          <p className="display mt-3 text-4xl">{formatPrice(revenue)}</p>
        </DashCard>
        <DashCard delay={0.1} className="p-6">
          <div className="flex items-start justify-between">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
              Pendente
            </p>
            <IconBubble icon={Banknote} tone="soft" size={16} />
          </div>
          <p className="display mt-3 text-4xl text-[var(--chocolate)]">
            {formatPrice(pendingAmount)}
          </p>
        </DashCard>
        <DashCard delay={0.15} className="p-6">
          <div className="flex items-start justify-between">
            <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
              Ticket médio
            </p>
            <IconBubble icon={TrendingUp} tone="soft" size={16} />
          </div>
          <p className="display mt-3 text-4xl text-[var(--chocolate)]">
            {formatPrice(ticket)}
          </p>
        </DashCard>
      </div>

      <DashCard delay={0.18} className="mt-6 p-6">
        <MonthlyRevenueChart height={200} />
      </DashCard>

      <div className="mt-6">
        <DashReveal delay={0.2}>
          <p className="eyebrow">Métodos de pagamento</p>
          <h2 className="display mt-2 text-3xl text-[var(--chocolate)]">
            Por método de pagamento
          </h2>
        </DashReveal>
        <div className="mt-4">
          <PaymentMethodCharts data={methods.length ? methods : paymentMethodMock} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashCard delay={0.25} className="p-6">
          <div className="flex items-center gap-3">
            <IconBubble icon={Wallet} tone="soft" size={16} />
            <h2 className="display text-2xl text-[var(--chocolate)]">
              Pagamentos recebidos
            </h2>
          </div>
          <ul className="mt-5 max-h-80 space-y-1 overflow-x-hidden overflow-y-auto">
            {paid.map((a) => (
              <li
                key={a.id}
                className="dash-row flex justify-between gap-3 rounded-xl px-3 py-3 text-sm"
              >
                <span>
                  {a.clientName}
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {a.paymentMethod} ·{" "}
                    {format(new Date(a.startsAt), "dd/MM", { locale: ptBR })}
                  </span>
                  <span className="mt-2 inline-block">
                    <StatusPill status="paid" />
                  </span>
                </span>
                <span className="display text-lg">{formatPrice(a.price)}</span>
              </li>
            ))}
          </ul>
        </DashCard>
        <DashCard delay={0.28} className="p-6">
          <div className="flex items-center gap-3">
            <IconBubble icon={Banknote} tone="soft" size={16} />
            <h2 className="display text-2xl text-[var(--chocolate)]">A receber</h2>
          </div>
          <ul className="mt-5 max-h-80 space-y-1 overflow-x-hidden overflow-y-auto">
            {pending.map((a) => (
              <li
                key={a.id}
                className="dash-row flex justify-between gap-3 rounded-xl px-3 py-3 text-sm"
              >
                <span>
                  {a.clientName}
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {a.serviceName}
                  </span>
                  <span className="mt-2 inline-block">
                    <StatusPill status="pending" />
                  </span>
                </span>
                <span className="display text-lg">{formatPrice(a.price)}</span>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>
    </>
  );
}
