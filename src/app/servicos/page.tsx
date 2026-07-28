import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { IconBubble } from "@/components/ui/IconBubble";
import {
  services,
  categoryLabels,
  formatPrice,
  formatDuration,
  type ServiceCategory,
} from "@/data/services";
import {
  CalendarDays,
  Clock,
  Sparkles,
  categoryIcons,
} from "@/lib/icons";

const order: ServiceCategory[] = [
  "facial",
  "micropigmentacao",
  "cilios",
  "corporal",
  "unhas",
  "depilacao",
];

export default function ServicosPage() {
  return (
    <>
      <Navbar />
      <main className="texture min-h-screen px-5 pb-20 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkles size={12} strokeWidth={1.8} />
            Catálogo completo
          </p>
          <h1 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
            Todos os serviços
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            Explore o cardápio completo da clínica. Valores a partir de — a
            confirmação final é feita no agendamento.
          </p>

          <div className="mt-14 space-y-14">
            {order.map((cat) => {
              const items = services.filter((s) => s.category === cat);
              const CatIcon = categoryIcons[cat];
              return (
                <section key={cat}>
                  <div className="flex items-center gap-3">
                    <IconBubble icon={CatIcon} tone="soft" size={18} />
                    <h2 className="display text-3xl text-[var(--chocolate)]">
                      {categoryLabels[cat]}
                    </h2>
                  </div>
                  <div className="gold-line my-5 max-w-xs origin-left" />
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        className="group flex items-start justify-between gap-4 border border-[var(--line)] bg-white/30 p-5 transition hover:border-[var(--gold)]"
                      >
                        <div className="flex gap-3">
                          <IconBubble
                            icon={CatIcon}
                            tone="soft"
                            size={15}
                            className="mt-0.5 !h-9 !w-9"
                          />
                          <div>
                            <h3 className="display text-xl text-[var(--chocolate)]">
                              {s.name}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                              {s.description}
                            </p>
                            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--brown)]">
                              <Clock size={11} strokeWidth={1.8} />
                              {formatDuration(s.durationMin)} · a partir de{" "}
                              {formatPrice(s.priceFrom)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/agendar?servico=${s.id}`}
                          className="btn-primary inline-flex shrink-0 !items-center gap-1.5 !px-3 !py-2 !text-[10px]"
                        >
                          <CalendarDays size={11} />
                          Agendar
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
