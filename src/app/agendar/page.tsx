import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function AgendarPage() {
  return (
    <>
      <Navbar />
      <main className="texture min-h-screen px-5 pb-20 pt-28 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="eyebrow">Agenda online</p>
          <h1 className="display mt-3 text-4xl text-[var(--chocolate)] md:text-5xl">
            Agende seu horário
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            Sistema nativo da clínica — rápido, elegante e integrado.
          </p>
          <Link
            href="/servicos"
            className="mt-4 inline-block text-xs tracking-[0.16em] uppercase text-[var(--gold-dim)]"
          >
            Ver catálogo de serviços
          </Link>
        </div>
        <Suspense
          fallback={
            <p className="text-center text-sm text-[var(--muted)]">
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
