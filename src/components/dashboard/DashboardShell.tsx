"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { brand } from "@/data/content";
import { cn } from "@/lib/utils";
import { dashNavIcons, ExternalLink, LogOut, Sparkles } from "@/lib/icons";
import { IconBubble } from "@/components/ui/IconBubble";

const nav = [
  { href: "/dashboard", label: "Centro" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/agendamentos", label: "Lista" },
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
    <div className="dash-root min-h-screen text-[var(--ink)] md:grid md:grid-cols-[260px_1fr]">
      <aside className="dash-aside relative overflow-hidden border-b border-white/10 px-5 py-6 text-[var(--cream)] md:min-h-screen md:border-b-0 md:border-r md:border-white/10">
        <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-[var(--gold)]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-32 w-32 rounded-full bg-[var(--nude)]/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <IconBubble icon={Sparkles} tone="cream" size={16} />
          <div>
            <p className="display text-2xl tracking-[0.15em] text-[var(--gold-bright)]">
              {brand.monogram}
            </p>
            <p className="mt-1 text-xs tracking-[0.18em] uppercase text-white/55">
              Dashboard · Lívia
            </p>
          </div>
        </motion.div>

        <nav className="relative z-10 mt-10 flex flex-row flex-wrap gap-2 overflow-x-hidden overflow-y-hidden pb-1 md:flex-col md:flex-nowrap md:gap-1.5 md:overflow-hidden md:pb-0">
          {nav.map((item, i) => {
            const active = pathname === item.href;
            const Icon = dashNavIcons[item.href];
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "dash-nav-link flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs tracking-[0.14em] uppercase no-underline",
                    active
                      ? "bg-white/12 text-[var(--gold-bright)] shadow-[inset_0_0_0_1px_rgba(212,184,150,0.35)]"
                      : "text-white/60",
                  )}
                >
                  {Icon && (
                    <IconBubble
                      icon={Icon}
                      tone="cream"
                      size={14}
                      className="!h-8 !w-8 !rounded-lg"
                    />
                  )}
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="relative z-10 mt-8 flex gap-4 md:mt-16 md:flex-col md:gap-3">
          <Link href="/" className="dash-aside-link inline-flex items-center gap-2">
            <ExternalLink size={14} strokeWidth={1.6} />
            Ver site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="dash-aside-link inline-flex items-center gap-2 text-left"
          >
            <LogOut size={14} strokeWidth={1.6} />
            Sair
          </button>
        </div>
      </aside>

      <main className="dash-main relative px-5 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-[var(--nude-deep)]/30 blur-3xl" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
