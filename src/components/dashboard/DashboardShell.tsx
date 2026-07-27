"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brand } from "@/data/content";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/agendamentos", label: "Agendamentos" },
  { href: "/dashboard/financeiro", label: "Financeiro" },
  { href: "/dashboard/profissionais", label: "Profissionais" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[var(--chocolate)] px-5 py-6 text-[var(--cream)] md:min-h-screen md:border-b-0 md:border-r md:border-[rgba(255,255,255,0.06)]">
        <p className="display text-2xl tracking-[0.15em] text-[var(--gold-bright)]">
          {brand.monogram}
        </p>
        <p className="mt-2 text-xs tracking-[0.18em] uppercase text-[rgba(250,246,240,0.6)]">
          Dashboard
        </p>
        <nav className="mt-10 flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap px-3 py-2 text-xs tracking-[0.14em] uppercase no-underline transition",
                pathname === item.href
                  ? "bg-[rgba(184,149,106,0.2)] text-[var(--gold-bright)]"
                  : "text-[rgba(250,246,240,0.65)] hover:text-[var(--cream)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex gap-3 md:mt-16 md:flex-col">
          <Link
            href="/"
            className="text-[10px] tracking-[0.16em] uppercase text-[rgba(250,246,240,0.5)] no-underline"
          >
            Ver site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-left text-[10px] tracking-[0.16em] uppercase text-[rgba(250,246,240,0.5)]"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
