"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { brand } from "@/data/content";
import { cn } from "@/lib/utils";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#equipe", label: "Equipe" },
  { href: "#sobre", label: "Sobre" },
  { href: "/agendar", label: "Agendar" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[rgba(250,246,240,0.88)] backdrop-blur-md border-b border-[var(--line)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="group flex items-center gap-3 no-underline">
          <span className="display text-2xl text-[var(--gold)] tracking-[0.15em] transition-transform duration-500 group-hover:scale-105">
            {brand.monogram}
          </span>
          <span className="hidden sm:block">
            <span className="display block text-sm tracking-[0.2em] uppercase text-[var(--chocolate)]">
              {brand.name}
            </span>
            <span className="block text-[10px] tracking-[0.18em] uppercase text-[var(--muted)]">
              {brand.subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] tracking-[0.2em] uppercase text-[var(--brown)] no-underline transition-colors hover:text-[var(--gold)]"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/agendar" className="btn-primary !py-2.5 !px-4 !text-[10px]">
            Agendar horário
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-px w-6 bg-[var(--chocolate)]" />
          <span className="block h-px w-6 bg-[var(--chocolate)]" />
          <span className="block h-px w-4 bg-[var(--chocolate)]" />
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--cream)] px-5 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.18em] uppercase text-[var(--chocolate)] no-underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
