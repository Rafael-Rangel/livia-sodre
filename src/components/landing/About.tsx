"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { aboutCopy, brand, guidelines } from "@/data/content";
import { IconBubble } from "@/components/ui/IconBubble";
import { CheckCircle2, MapPin, Phone, Sparkles } from "@/lib/icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll(".about-reveal");
      if (!items?.length) return;

      gsap.from(items, {
        y: 22,
        duration: 0.7,
        stagger: 0.08,
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
          <p className="about-reveal eyebrow inline-flex items-center gap-2 text-[var(--gold-bright)]">
            <Sparkles size={12} strokeWidth={1.8} />
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
          <div className="flex items-center gap-3">
            <IconBubble icon={CheckCircle2} tone="cream" size={16} />
            <div>
              <p className="eyebrow text-[var(--gold-bright)]">Orientações</p>
              <h3 className="display mt-1 text-2xl">Para a melhor experiência</h3>
            </div>
          </div>
          <ul className="mt-6 space-y-4">
            {guidelines.slice(0, 5).map((g) => (
              <li
                key={g}
                className="flex gap-3 text-sm leading-relaxed text-[rgba(250,246,240,0.75)]"
              >
                <CheckCircle2
                  size={16}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-[var(--gold)]"
                />
                {g}
              </li>
            ))}
          </ul>
          <div className="gold-line my-8" />
          <p className="inline-flex items-start gap-2 text-xs tracking-[0.18em] uppercase text-[var(--gold-bright)]">
            <MapPin size={14} strokeWidth={1.7} className="mt-0.5 shrink-0" />
            {brand.address.full}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-[rgba(250,246,240,0.7)]">
            <Phone size={14} strokeWidth={1.7} />
            Tel. {brand.phone}
          </p>
        </div>
      </div>
    </section>
  );
}
