import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSession } from "@/lib/auth";
import {
  getFinancialSummary,
  listAppointments,
} from "@/lib/appointments";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/data/services";

export default async function DashboardHomePage() {
  const session = await getSession();
  if (!session) redirect("/dashboard/login");

  const summary = getFinancialSummary();
  const upcoming = listAppointments()
    .filter((a) => a.status !== "cancelled" && a.status !== "completed")
    .slice(0, 5);

  const cards = [
    { label: "Receita confirmada", value: formatPrice(summary.revenue) },
    { label: "A receber", value: formatPrice(summary.pendingAmount) },
    { label: "Agendamentos", value: String(summary.totalAppointments) },
    { label: "Confirmados", value: String(summary.confirmed) },
  ];

  return (
    <DashboardShell>
      <p className="eyebrow">Visão geral</p>
      <h1 className="display mt-2 text-4xl text-[var(--chocolate)]">
        Olá, Lívia
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Painel premium — financeiro, agenda e desempenho por profissional.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="border border-[var(--line)] bg-white/50 p-5"
          >
            <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
              {c.label}
            </p>
            <p className="display mt-3 text-3xl text-[var(--chocolate)]">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="border border-[var(--line)] bg-white/40 p-6">
          <h2 className="display text-2xl text-[var(--chocolate)]">
            Próximos agendamentos
          </h2>
          <ul className="mt-6 space-y-4">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4"
              >
                <div>
                  <p className="font-medium text-[var(--chocolate)]">
                    {a.clientName}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {a.serviceName} · {a.professionalName}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-[var(--brown)]">
                  {format(new Date(a.startsAt), "dd MMM · HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-[var(--line)] bg-white/40 p-6">
          <h2 className="display text-2xl text-[var(--chocolate)]">
            Por profissional
          </h2>
          <ul className="mt-6 space-y-4">
            {summary.byProfessional.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between border-b border-[var(--line)] pb-4"
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
        </section>
      </div>
    </DashboardShell>
  );
}
