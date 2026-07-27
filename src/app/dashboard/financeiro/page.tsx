import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getFinancialSummary, listAppointments } from "@/lib/appointments";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/data/services";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function FinanceiroPage() {
  const session = await getSession();
  if (!session) redirect("/dashboard/login");

  const summary = getFinancialSummary();
  const paid = listAppointments().filter((a) => a.paymentStatus === "paid");
  const pending = listAppointments().filter(
    (a) => a.paymentStatus === "pending" && a.status !== "cancelled",
  );

  return (
    <DashboardShell>
      <p className="eyebrow">Financeiro</p>
      <h1 className="display mt-2 text-4xl text-[var(--chocolate)]">
        Caixa da clínica
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--line)] bg-[var(--chocolate)] p-6 text-[var(--cream)]">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--gold-bright)]">
            Recebido
          </p>
          <p className="display mt-3 text-4xl">{formatPrice(summary.revenue)}</p>
        </div>
        <div className="border border-[var(--line)] bg-white/50 p-6">
          <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
            Pendente
          </p>
          <p className="display mt-3 text-4xl text-[var(--chocolate)]">
            {formatPrice(summary.pendingAmount)}
          </p>
        </div>
        <div className="border border-[var(--line)] bg-white/50 p-6">
          <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
            Ticket médio
          </div>
          <p className="display mt-3 text-4xl text-[var(--chocolate)]">
            {formatPrice(
              summary.completed
                ? Math.round(summary.revenue / Math.max(summary.completed, 1))
                : summary.revenue,
            )}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="border border-[var(--line)] bg-white/40 p-6">
          <h2 className="display text-2xl">Pagamentos recebidos</h2>
          <ul className="mt-5 space-y-3">
            {paid.map((a) => (
              <li
                key={a.id}
                className="flex justify-between gap-3 border-b border-[var(--line)] pb-3 text-sm"
              >
                <span>
                  {a.clientName}
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {a.paymentMethod} ·{" "}
                    {format(new Date(a.startsAt), "dd/MM", { locale: ptBR })}
                  </span>
                </span>
                <span className="display text-lg">{formatPrice(a.price)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="border border-[var(--line)] bg-white/40 p-6">
          <h2 className="display text-2xl">A receber</h2>
          <ul className="mt-5 space-y-3">
            {pending.map((a) => (
              <li
                key={a.id}
                className="flex justify-between gap-3 border-b border-[var(--line)] pb-3 text-sm"
              >
                <span>
                  {a.clientName}
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {a.serviceName}
                  </span>
                </span>
                <span className="display text-lg">{formatPrice(a.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
