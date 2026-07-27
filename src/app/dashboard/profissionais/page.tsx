import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getFinancialSummary } from "@/lib/appointments";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { team } from "@/data/team";
import { formatPrice } from "@/data/services";

export default async function ProfissionaisPage() {
  const session = await getSession();
  if (!session) redirect("/dashboard/login");

  const summary = getFinancialSummary();
  const stats = Object.fromEntries(
    summary.byProfessional.map((p) => [p.name, p]),
  );

  return (
    <DashboardShell>
      <p className="eyebrow">Equipe</p>
      <h1 className="display mt-2 text-4xl text-[var(--chocolate)]">
        Profissionais
      </h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {team.map((p) => {
          const s = stats[p.name];
          return (
            <article
              key={p.id}
              className="flex gap-5 border border-[var(--line)] bg-white/40 p-5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <h2 className="script text-3xl text-[var(--gold)]">{p.name}</h2>
                <p className="text-xs tracking-[0.14em] uppercase text-[var(--muted)]">
                  {p.role}
                </p>
                <p className="mt-3 text-sm text-[var(--brown)]">
                  {s
                    ? `${s.count} agendamentos · ${formatPrice(s.revenue)}`
                    : "Sem agendamentos ainda"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.specialties.map((sp) => (
                    <span
                      key={sp}
                      className="border border-[var(--line)] px-2 py-1 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)]"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardShell>
  );
}
