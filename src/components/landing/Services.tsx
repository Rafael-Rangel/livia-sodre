"use client";

import Link from "next/link";
import { useRef } from "react";
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
import { useState } from "react";

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

      gsap.fromTo(
        items,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "power2.out",
          overwrite: "auto",
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
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
          <p className="eyebrow">Catálogo de experiências</p>
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
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "border border-[var(--chocolate)] bg-[var(--chocolate)] px-4 py-2 text-[10px] tracking-[0.16em] uppercase text-[var(--cream)]"
                  : "border border-[var(--line)] bg-transparent px-4 py-2 text-[10px] tracking-[0.16em] uppercase text-[var(--brown)] hover:border-[var(--gold)]"
              }
            >
              {f === "all" ? "Destaques" : categoryLabels[f]}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <article
              key={s.id}
              className="svc-item group border border-[var(--line)] bg-[rgba(255,255,255,0.35)] p-6 transition-all duration-400 hover:border-[var(--gold)] hover:bg-white/50"
            >
              <p className="eyebrow text-[var(--gold-dim)]">
                {categoryLabels[s.category]}
              </p>
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
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDuration(s.durationMin)}
                  </p>
                </div>
                <Link
                  href={`/agendar?servico=${s.id}`}
                  className="btn-primary !px-3 !py-2 !text-[10px]"
                >
                  Agendar
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/servicos" className="btn-ghost">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
