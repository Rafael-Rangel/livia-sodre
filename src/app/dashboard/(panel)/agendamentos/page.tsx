"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { DashCard, DashReveal, StatusPill } from "@/components/dashboard/DashUI";
import { IconBubble } from "@/components/ui/IconBubble";
import { formatPrice } from "@/data/services";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
  statusIcons,
  XCircle,
} from "@/lib/icons";
import type { Appointment } from "@/lib/types";

const filters = ["todos", "pending", "confirmed", "completed", "cancelled"] as const;

export default function AgendamentosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]>("todos");
  const [query, setQuery] = useState("");

  async function load() {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.replace("/dashboard/login");
      return;
    }
    const res = await fetch("/api/appointments");
    setItems(await res.json());
    setReady(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(id: string, body: Partial<Appointment>) {
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    await load();
  }

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const okStatus = filter === "todos" || a.status === filter;
      const q = query.trim().toLowerCase();
      const okQuery =
        !q ||
        a.clientName.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q) ||
        a.professionalName.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [items, filter, query]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-[var(--muted)]">
        <Clock size={16} className="animate-pulse" />
        Carregando agenda...
      </div>
    );
  }

  return (
    <>
      <DashReveal>
        <div className="flex items-center gap-3">
          <IconBubble icon={CalendarDays} tone="soft" />
          <p className="eyebrow">Agenda</p>
        </div>
        <h1 className="display mt-2 text-4xl text-[var(--chocolate)] md:text-5xl">
          Agendamentos
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {items.length} registros mockados · filtre e gerencie status
        </p>
      </DashReveal>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => {
            const Icon = f === "todos" ? CalendarDays : statusIcons[f];
            return (
              <motion.button
                key={f}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition ${
                  filter === f
                    ? "bg-[var(--chocolate)] text-[var(--cream)]"
                    : "bg-white/50 text-[var(--muted)] hover:bg-white/80"
                }`}
              >
                {Icon && <Icon size={12} strokeWidth={2} />}
                {f}
              </motion.button>
            );
          })}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, serviço..."
            className="w-full rounded-xl border border-white/50 bg-white/40 py-2.5 pl-9 pr-4 text-sm outline-none backdrop-blur transition focus:border-[var(--gold)]"
          />
        </div>
      </div>

      <DashCard delay={0.1} className="mt-6 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/40 text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Profissional</th>
                <th className="px-4 py-3 font-medium">Horário</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className="dash-row border-b border-white/30"
                >
                  <td className="px-4 py-3">
                    <p className="text-[var(--chocolate)]">{a.clientName}</p>
                    <p className="text-xs text-[var(--muted)]">{a.clientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--brown)]">{a.serviceName}</td>
                  <td className="px-4 py-3">{a.professionalName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={12} strokeWidth={1.8} className="text-[var(--gold-dim)]" />
                      {format(new Date(a.startsAt), "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPrice(a.price)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={a.paymentStatus} />
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {a.paymentMethod}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="dash-btn inline-flex items-center gap-1"
                        onClick={() =>
                          patch(a.id, {
                            status: "confirmed",
                            paymentStatus: a.paymentStatus,
                          })
                        }
                      >
                        <CalendarCheck size={11} />
                        Confirmar
                      </button>
                      <button
                        type="button"
                        className="dash-btn inline-flex items-center gap-1"
                        onClick={() =>
                          patch(a.id, {
                            status: "completed",
                            paymentStatus: "paid",
                          })
                        }
                      >
                        <CheckCircle2 size={11} />
                        Concluir
                      </button>
                      <button
                        type="button"
                        className="dash-btn dash-btn-danger inline-flex items-center gap-1"
                        onClick={() => patch(a.id, { status: "cancelled" })}
                      >
                        <XCircle size={11} />
                        Cancelar
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
