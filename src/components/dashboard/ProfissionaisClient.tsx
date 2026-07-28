"use client";

import { motion } from "framer-motion";
import { DashCard, DashReveal } from "@/components/dashboard/DashUI";
import { IconBubble } from "@/components/ui/IconBubble";
import { formatPrice } from "@/data/services";
import { Sparkles, Users } from "@/lib/icons";

type Pro = {
  id: string;
  name: string;
  role: string;
  image: string;
  specialties: string[];
};

type Stat = { name: string; count: number; revenue: number };

export function ProfissionaisClient({
  team,
  stats,
}: {
  team: Pro[];
  stats: Record<string, Stat>;
}) {
  const maxRev = Math.max(1, ...Object.values(stats).map((s) => s.revenue));

  return (
    <>
      <DashReveal>
        <div className="flex items-center gap-3">
          <IconBubble icon={Users} tone="soft" />
          <p className="eyebrow">Equipe</p>
        </div>
        <h1 className="display mt-2 text-4xl text-[var(--chocolate)] md:text-5xl">
          Profissionais
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Desempenho por profissional com base nos agendamentos mockados.
        </p>
      </DashReveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {team.map((p, i) => {
          const s = stats[p.name];
          const pct = s ? Math.round((s.revenue / maxRev) * 100) : 0;
          return (
            <DashCard key={p.id} delay={0.08 * i} className="p-5">
              <div className="flex gap-5">
                <motion.img
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  src={p.image}
                  alt={p.name}
                  className="h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-white/60"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="script text-3xl text-[var(--gold)]">
                        {p.name}
                      </h2>
                      <p className="text-xs tracking-[0.14em] uppercase text-[var(--muted)]">
                        {p.role}
                      </p>
                    </div>
                    <IconBubble icon={Sparkles} tone="soft" size={14} className="!h-8 !w-8" />
                  </div>
                  <p className="mt-3 text-sm text-[var(--brown)]">
                    {s
                      ? `${s.count} agendamentos · ${formatPrice(s.revenue)}`
                      : "Sem agendamentos ainda"}
                  </p>
                  <div className="mt-3 dash-bar">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.specialties.map((sp) => (
                      <motion.span
                        key={sp}
                        whileHover={{ y: -2, scale: 1.03 }}
                        className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/40 px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)]"
                      >
                        <Sparkles size={10} strokeWidth={2} />
                        {sp}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>
    </>
  );
}
