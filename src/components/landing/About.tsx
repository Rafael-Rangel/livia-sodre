"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { aboutCopy, brand, guidelines } from "@/data/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll(".about-reveal");
      if (!items?.length) return;

      gsap.fromTo(
        items,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      id="sobre"
      ref={root}
      className="relative overflow-hidden bg-[var(--chocolate)] px-5 py-24 text-[var(--cream)] md:px-8"
    >
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[var(--gold)] opacity-10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2">
        <div>
          <p className="about-reveal eyebrow text-[var(--gold-bright)]">
            Sobre a clínica
          </p>
          <h2 className="about-reveal display mt-3 text-4xl md:text-5xl">
            Mais do que estética
          </h2>
          <p className="about-reveal mt-6 leading-relaxed text-[rgba(250,246,240,0.78)]">
            {aboutCopy.welcome}
          </p>
          <p className="about-reveal mt-4 leading-relaxed text-[rgba(250,246,240,0.78)]">
            {aboutCopy.body}
          </p>
          <p className="about-reveal mt-4 leading-relaxed text-[rgba(250,246,240,0.78)]">
            {aboutCopy.purpose}
          </p>
          <p className="about-reveal script mt-8 text-3xl text-[var(--gold-bright)]">
            {aboutCopy.unique}
          </p>
        </div>

        <div className="about-reveal border border-[rgba(212,184,150,0.25)] bg-[rgba(255,255,255,0.03)] p-8">
          <p className="eyebrow text-[var(--gold-bright)]">Orientações</p>
          <h3 className="display mt-3 text-2xl">Para a melhor experiência</h3>
          <ul className="mt-6 space-y-4">
            {guidelines.slice(0, 5).map((g) => (
              <li
                key={g}
                className="flex gap-3 text-sm leading-relaxed text-[rgba(250,246,240,0.75)]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                {g}
              </li>
            ))}
          </ul>
          <div className="gold-line my-8" />
          <p className="text-xs tracking-[0.18em] uppercase text-[var(--gold-bright)]">
            {brand.address.full}
          </p>
          <p className="mt-2 text-sm text-[rgba(250,246,240,0.7)]">
            Tel. {brand.phone}
          </p>
        </div>
      </div>
    </section>
  );
}
