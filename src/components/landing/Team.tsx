"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { team } from "@/data/team";
import { aboutCopy } from "@/data/content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Team() {
  const root = useRef<HTMLElement>(null);
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
            <p className="eyebrow">Nossa equipe</p>
            <h2 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
              Conheça quem cuida de você
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {aboutCopy.slogan}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {members.map((m) => (
            <article key={m.id} className="team-card group">
              <div className="arch-frame relative aspect-[3/4] bg-[var(--nude-deep)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt={m.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,31,26,0.55)] via-transparent to-transparent" />
              </div>
              <p className="eyebrow mt-5">Conheça a</p>
              <h3 className="script mt-1 text-4xl text-[var(--gold)]">
                {m.name}
              </h3>
              <p className="mt-2 text-xs tracking-[0.14em] uppercase text-[var(--brown)]">
                {m.role}
              </p>
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
