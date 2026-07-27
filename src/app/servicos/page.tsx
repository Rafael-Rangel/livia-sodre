import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  services,
  categoryLabels,
  formatPrice,
  formatDuration,
  type ServiceCategory,
} from "@/data/services";

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
          <p className="eyebrow">Catálogo completo</p>
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
              return (
                <section key={cat}>
                  <h2 className="display text-3xl text-[var(--chocolate)]">
                    {categoryLabels[cat]}
                  </h2>
                  <div className="gold-line my-5 max-w-xs origin-left" />
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-start justify-between gap-4 border border-[var(--line)] bg-white/30 p-5"
                      >
                        <div>
                          <h3 className="display text-xl text-[var(--chocolate)]">
                            {s.name}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {s.description}
                          </p>
                          <p className="mt-3 text-xs text-[var(--brown)]">
                            {formatDuration(s.durationMin)} · a partir de{" "}
                            {formatPrice(s.priceFrom)}
                          </p>
                        </div>
                        <Link
                          href={`/agendar?servico=${s.id}`}
                          className="btn-primary shrink-0 !px-3 !py-2 !text-[10px]"
                        >
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
