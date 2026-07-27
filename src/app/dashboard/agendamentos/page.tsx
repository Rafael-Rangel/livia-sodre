"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/data/services";
import type { Appointment } from "@/lib/types";

export default function AgendamentosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);

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

  async function patch(id: string, patch: Partial<Appointment>) {
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    await load();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Carregando...
      </div>
    );
  }

  return (
    <DashboardShell>
      <p className="eyebrow">Agenda</p>
      <h1 className="display mt-2 text-4xl text-[var(--chocolate)]">
        Agendamentos
      </h1>

      <div className="mt-8 overflow-x-auto border border-[var(--line)] bg-white/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="px-4 py-3 font-medium">Profissional</th>
              <th className="px-4 py-3 font-medium">Horário</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b border-[var(--line)]">
                <td className="px-4 py-3">
                  <p className="text-[var(--chocolate)]">{a.clientName}</p>
                  <p className="text-xs text-[var(--muted)]">{a.clientPhone}</p>
                </td>
                <td className="px-4 py-3 text-[var(--brown)]">{a.serviceName}</td>
                <td className="px-4 py-3">{a.professionalName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {format(new Date(a.startsAt), "dd/MM HH:mm", { locale: ptBR })}
                </td>
                <td className="px-4 py-3">{formatPrice(a.price)}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-[10px] tracking-[0.12em] uppercase text-[var(--gold-dim)]"
                      onClick={() =>
                        patch(a.id, {
                          status: "confirmed",
                          paymentStatus: a.paymentStatus,
                        })
                      }
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="text-[10px] tracking-[0.12em] uppercase text-[var(--gold-dim)]"
                      onClick={() =>
                        patch(a.id, {
                          status: "completed",
                          paymentStatus: "paid",
                        })
                      }
                    >
                      Concluir
                    </button>
                    <button
                      type="button"
                      className="text-[10px] tracking-[0.12em] uppercase text-red-800/70"
                      onClick={() => patch(a.id, { status: "cancelled" })}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
