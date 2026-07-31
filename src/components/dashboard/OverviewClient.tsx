"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashCard, DashReveal, StatusPill } from "@/components/dashboard/DashUI";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { IconBubble } from "@/components/ui/IconBubble";
import { formatPrice } from "@/data/services";
import {
  occupancyByHour,
  recentReviews,
} from "@/data/dashboard-mock";
import {
  Banknote,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from "@/lib/icons";
import type { Appointment } from "@/lib/types";

type ProStat = { name: string; count: number; revenue: number };

type Props = {
  cards: { label: string; value: string }[];
  upcoming: Appointment[];
  byProfessional: ProStat[];
  totals: {
    confirmed: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
};

const cardIcons: Record<string, LucideIcon> = {
  "Receita confirmada": Wallet,
  "A receber": Banknote,
  Agendamentos: CalendarCheck,
  Confirmados: CheckCircle2,
};

const totalIcons: Record<string, LucideIcon> = {
  Pendentes: CalendarClock,
  Confirmados: CalendarCheck,
  Concluídos: CheckCircle2,
  Cancelados: XCircle,
};

export function OverviewClient({
  cards,
  upcoming,
  byProfessional,
  totals,
}: Props) {
  return (
    <>
      <DashReveal>
        <div className="flex items-center gap-3">
          <IconBubble icon={TrendingUp} tone="soft" />
          <p className="eyebrow">Visão geral</p>
        </div>
        <h1 className="display mt-2 text-4xl text-[var(--chocolate)] md:text-5xl">
          Olá, Lívia
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Painel com agenda, financeiro e desempenho. Dados de demonstração
          para visualizar o fluxo completo da clínica.
        </p>
      </DashReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = cardIcons[c.label] || Wallet;
          return (
            <DashCard key={c.label} delay={0.05 * i} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
                  {c.label}
                </p>
                <IconBubble icon={Icon} tone="soft" size={16} />
              </div>
              <p className="display mt-3 text-3xl text-[var(--chocolate)]">
                {c.value}
              </p>
            </DashCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Pendentes", value: totals.pending },
          { label: "Confirmados", value: totals.confirmed },
          { label: "Concluídos", value: totals.completed },
          { label: "Cancelados", value: totals.cancelled },
        ].map((s, i) => {
          const Icon = totalIcons[s.label];
          return (
            <DashCard key={s.label} delay={0.12 + i * 0.04} className="px-4 py-3">
              <div className="flex items-center gap-2">
                {Icon && <Icon size={14} strokeWidth={1.7} className="text-[var(--gold-dim)]" />}
                <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--muted)]">
                  {s.label}
                </p>
              </div>
              <p className="display mt-1 text-2xl text-[var(--gold-dim)]">
                {s.value}
              </p>
            </DashCard>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        <DashCard delay={0.15} className="p-6 xl:col-span-2">
          <MonthlyRevenueChart />
        </DashCard>

        <DashCard delay={0.2} className="p-6">
          <div className="flex items-center gap-3">
            <IconBubble icon={Clock} tone="soft" size={16} />
            <h2 className="display text-2xl text-[var(--chocolate)]">
              Ocupação do dia
            </h2>
          </div>
          <ul className="mt-6 space-y-3">
            {occupancyByHour.map((o) => (
              <li key={o.hour} className="dash-row -mx-2 rounded-lg px-2 py-1.5">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[var(--brown)]">
                    <Clock size={11} strokeWidth={1.8} />
                    {o.hour}
                  </span>
                  <span className="text-[var(--muted)]">{o.pct}%</span>
                </div>
                <div className="dash-bar">
                  <span style={{ width: `${o.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashCard delay={0.22} className="p-6">
          <div className="flex items-center gap-3">
            <IconBubble icon={CalendarClock} tone="soft" size={16} />
            <h2 className="display text-2xl text-[var(--chocolate)]">
              Próximos agendamentos
            </h2>
          </div>
          <ul className="mt-6 space-y-1">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="dash-row flex items-start justify-between gap-3 rounded-xl px-3 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--chocolate)]">
                    {a.clientName}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {a.serviceName} · {a.professionalName}
                  </p>
                  <div className="mt-2">
                    <StatusPill status={a.status} />
                  </div>
                </div>
                <p className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--brown)]">
                  <Clock size={12} strokeWidth={1.8} />
                  {format(new Date(a.startsAt), "dd MMM · HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </li>
            ))}
          </ul>
        </DashCard>

        <DashCard delay={0.26} className="p-6">
          <div className="flex items-center gap-3">
            <IconBubble icon={Users} tone="soft" size={16} />
            <h2 className="display text-2xl text-[var(--chocolate)]">
              Por profissional
            </h2>
          </div>
          <ul className="mt-6 space-y-1">
            {byProfessional.map((p) => (
              <li
                key={p.name}
                className="dash-row flex items-center justify-between rounded-xl px-3 py-3"
              >
                <div>
                  <p className="text-[var(--chocolate)]">{p.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {p.count} atendimentos
                  </p>
                </div>
                <p className="display text-xl text-[var(--gold-dim)]">
                  {formatPrice(p.revenue)}
                </p>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>

      <DashCard delay={0.3} className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <IconBubble icon={Star} tone="soft" size={16} />
          <h2 className="display text-2xl text-[var(--chocolate)]">
            Avaliações recentes
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recentReviews.map((r) => (
            <article
              key={r.id}
              className="dash-row rounded-xl border border-white/40 bg-white/35 p-4"
            >
              <p className="text-sm font-medium text-[var(--chocolate)]">
                {r.clientName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase text-[var(--gold-dim)]">
                <Star size={11} strokeWidth={2} fill="currentColor" />
                {r.rating} · {r.serviceName}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--brown)]">
                “{r.text}”
              </p>
              <p className="mt-3 text-[10px] text-[var(--muted)]">
                {format(new Date(r.date), "dd MMM yyyy", { locale: ptBR })}
              </p>
            </article>
          ))}
        </div>
      </DashCard>
    </>
  );
}
