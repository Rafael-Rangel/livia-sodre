"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  services,
  formatPrice,
  formatDuration,
  categoryLabels,
  type ServiceCategory,
} from "@/data/services";
import { IconBubble } from "@/components/ui/IconBubble";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  categoryIcons,
  Sparkles,
} from "@/lib/icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const filters: Array<ServiceCategory | "all"> = [
  "all",
  "facial",
  "micropigmentacao",
  "cilios",
  "corporal",
  "unhas",
  "depilacao",
];

export function Services() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<ServiceCategory | "all">("all");
  const featured = services.filter((s) => s.featured || s.popular);
  const list =
    filter === "all"
      ? featured
      : services.filter((s) => s.category === filter);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll(".svc-item");
      if (!items?.length) return;

      gsap.from(items, {
        y: 22,
        duration: 0.65,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: root.current,
          start: "top 90%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  );

  return (
    <section
      id="servicos"
      ref={root}
      className="relative bg-[var(--cream)] px-5 py-24 md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkles size={12} strokeWidth={1.8} />
            Catálogo de experiências
          </p>
          <h2 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
            Serviços pensados para você
          </h2>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            Do design de sobrancelhas à micropigmentação, estética facial,
            corporal e nail design — escolha o cuidado ideal e agende em poucos
            passos.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => {
            const Icon = f === "all" ? Sparkles : categoryIcons[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "inline-flex items-center gap-1.5 border border-[var(--chocolate)] bg-[var(--chocolate)] px-4 py-2 text-[10px] tracking-[0.16em] uppercase text-[var(--cream)]"
                    : "inline-flex items-center gap-1.5 border border-[var(--line)] bg-transparent px-4 py-2 text-[10px] tracking-[0.16em] uppercase text-[var(--brown)] hover:border-[var(--gold)]"
                }
              >
                <Icon size={12} strokeWidth={1.8} />
                {f === "all" ? "Destaques" : categoryLabels[f]}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const Icon = categoryIcons[s.category];
            return (
              <article
                key={s.id}
                className="svc-item group border border-[var(--line)] bg-[rgba(255,255,255,0.35)] p-6 transition-all duration-400 hover:border-[var(--gold)] hover:bg-white/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="eyebrow text-[var(--gold-dim)]">
                    {categoryLabels[s.category]}
                  </p>
                  <IconBubble icon={Icon} tone="soft" size={16} />
                </div>
                <h3 className="display mt-3 text-2xl text-[var(--chocolate)]">
                  {s.name}
                </h3>
                <p className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-[var(--muted)]">
                  {s.description}
                </p>
                <div className="mt-6 flex items-end justify-between gap-3 border-t border-[var(--line)] pt-4">
                  <div>
                    <p className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted)]">
                      A partir de
                    </p>
                    <p className="display text-xl text-[var(--chocolate)]">
                      {formatPrice(s.priceFrom)}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Clock size={11} strokeWidth={1.8} />
                      {formatDuration(s.durationMin)}
                    </p>
                  </div>
                  <Link
                    href={`/agendar?servico=${s.id}`}
                    className="btn-primary inline-flex !items-center gap-1.5 !px-3 !py-2 !text-[10px]"
                  >
                    <CalendarDays size={11} />
                    Agendar
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/servicos" className="btn-ghost inline-flex items-center gap-2">
            Ver catálogo completo
            <ArrowRight size={14} strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </section>
  );
}
