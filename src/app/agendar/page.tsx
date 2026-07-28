import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { IconBubble } from "@/components/ui/IconBubble";
import { ArrowRight, CalendarDays, Clock } from "@/lib/icons";

export default function AgendarPage() {
  return (
    <>
      <Navbar />
      <main className="texture min-h-screen px-5 pb-20 pt-28 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="flex justify-center">
            <IconBubble icon={CalendarDays} tone="gold" size={20} className="!h-12 !w-12 !rounded-2xl" />
          </div>
          <p className="eyebrow mt-4">Agenda online</p>
          <h1 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
            Agende seu horário
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            Sistema nativo da clínica — rápido, elegante e integrado.
          </p>
          <Link
            href="/servicos"
            className="mt-4 inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-[var(--gold-dim)]"
          >
            Ver catálogo de serviços
            <ArrowRight size={12} strokeWidth={1.7} />
          </Link>
        </div>
        <Suspense
          fallback={
            <p className="inline-flex w-full items-center justify-center gap-2 text-sm text-[var(--muted)]">
              <Clock size={14} className="animate-pulse" />
              Carregando agenda...
            </p>
          }
        >
          <BookingWizard />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
