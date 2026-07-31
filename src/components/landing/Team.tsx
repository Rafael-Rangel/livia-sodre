"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { team } from "@/data/team";
import { aboutCopy } from "@/data/content";
import { Sparkles, Users } from "@/lib/icons";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Team() {
  const root = useRef<HTMLElement>(null);
  const founder = team.find((m) => m.id === "livia");
  const members = team.filter((m) => m.id !== "livia");

  useGSAP(
    () => {
      const cards = root.current?.querySelectorAll(".team-card");
      if (!cards?.length) return;

      gsap.from(cards, {
        y: 28,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
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
      id="equipe"
      ref={root}
      className="bg-[var(--nude)] px-5 py-24 md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <Users size={12} strokeWidth={1.8} />
              Nossa equipe
            </p>
            <h2 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
              Conheça quem cuida de você
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {aboutCopy.slogan}
          </p>
        </div>

        {founder && (
          <article className="team-card mb-10 grid items-center gap-8 overflow-hidden rounded-[1.75rem] border border-white/50 bg-gradient-to-br from-[#faf6f0] via-[#f0e6d8] to-[#e4d5c3] p-5 md:grid-cols-[minmax(0,0.95fr)_1.1fr] md:gap-10 md:p-8">
            <div className="arch-frame relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-[var(--nude-deep)] md:mx-0">
              <Image
                src={founder.image}
                alt={founder.name}
                fill
                sizes="(max-width: 768px) 90vw, 40vw"
                quality={95}
                priority
                className="object-cover object-[center_12%] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,31,26,0.35)] via-transparent to-transparent" />
            </div>
            <div>
              <p className="eyebrow">Fundadora</p>
              <h3 className="script mt-2 text-5xl text-[var(--gold)] md:text-6xl">
                {founder.name}
              </h3>
              <p className="mt-3 text-xs tracking-[0.14em] uppercase text-[var(--brown)]">
                {founder.role}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {founder.specialties.map((sp) => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 border border-[var(--line)] bg-white/45 px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)]"
                  >
                    <Sparkles size={9} strokeWidth={2} />
                    {sp}
                  </span>
                ))}
              </div>
              {founder.bio.map((line) => (
                <p
                  key={line}
                  className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--brown)] md:text-base"
                >
                  {line}
                </p>
              ))}
            </div>
          </article>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {members.map((m) => (
            <article key={m.id} className="team-card group">
              <div className="arch-frame relative aspect-[3/4] overflow-hidden bg-[var(--nude-deep)]">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 30vw"
                  quality={95}
                  className={cn(
                    "object-cover transition-transform duration-700 group-hover:scale-105",
                    "object-[center_18%]",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,31,26,0.55)] via-transparent to-transparent" />
                <div className="absolute right-4 top-4 rounded-full bg-[rgba(250,246,240,0.9)] p-2 text-[var(--gold-dim)] shadow-sm backdrop-blur">
                  <Sparkles size={14} strokeWidth={1.7} />
                </div>
              </div>
              <p className="eyebrow mt-5">Conheça a</p>
              <h3 className="script mt-1 text-4xl text-[var(--gold)]">
                {m.name}
              </h3>
              <p className="mt-2 text-xs tracking-[0.14em] uppercase text-[var(--brown)]">
                {m.role}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.specialties.slice(0, 3).map((sp) => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 border border-[var(--line)] bg-white/30 px-2 py-1 text-[10px] tracking-[0.12em] uppercase text-[var(--muted)]"
                  >
                    <Sparkles size={9} strokeWidth={2} />
                    {sp}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                {m.bio[0]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
