"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { brand } from "@/data/content";
import { Atmosphere } from "./Atmosphere";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-brand", { y: 40, opacity: 0, duration: 1.1 })
        .from(".hero-line", { scaleX: 0, duration: 0.8 }, "-=0.4")
        .from(".hero-title", { y: 50, opacity: 0, duration: 1 }, "-=0.5")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.9 }, "-=0.55")
        .from(
          ".hero-cta",
          { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 },
          "-=0.4",
        )
        .from(".hero-arch", { y: 80, opacity: 0, duration: 1.2 }, "-=1");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="texture relative min-h-[100svh] overflow-hidden"
    >
      <Atmosphere />
      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pt-24">
        <div>
          <p className="hero-brand eyebrow mb-5">{brand.subtitle}</p>
          <h1 className="hero-brand display text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.92] text-[var(--chocolate)]">
            {brand.name}
          </h1>
          <div className="hero-line gold-line my-7 origin-left" />
          <p className="hero-title script text-[clamp(2.4rem,6vw,4rem)] text-[var(--gold)]">
            Beleza que transforma
          </p>
          <p className="hero-sub mt-5 max-w-md text-[var(--muted)] leading-relaxed">
            {brand.tagline} Clínica de estética avançada em Guaratiba — cuidado
            personalizado para realçar o que já é naturalmente seu.
          </p>
          <div className="hero-cta mt-10 flex flex-wrap gap-3">
            <Link href="/agendar" className="btn-primary">
              Agendar agora
            </Link>
            <Link href="#servicos" className="btn-ghost">
              Ver serviços
            </Link>
          </div>
        </div>

        <div className="hero-arch relative mx-auto w-full max-w-md">
          <div className="arch-frame relative aspect-[3/4] bg-[var(--nude-deep)] shadow-[var(--shadow)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/team/yame.webp"
              alt="Equipe Lívia Sodré"
              className="h-full w-full object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,31,26,0.45)] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="eyebrow text-[var(--gold-bright)]">Guaratiba · RJ</p>
              <p className="display mt-2 text-2xl text-[var(--cream)]">
                Estética · Spa · Micropigmentação
              </p>
            </div>
          </div>
          <div className="absolute -left-4 top-1/3 hidden h-40 w-px bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent md:block" />
        </div>
      </div>
    </section>
  );
}
