"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { brand } from "@/data/content";
import { whatsappLink } from "@/lib/utils";

export function BookingCTA() {
  return (
    <section className="bg-[var(--paper)] px-5 py-24 md:px-8">
      <motion.div
        initial={{ y: 28 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <p className="eyebrow">Agendamento nativo</p>
        <h2 className="display mt-4 text-4xl text-[var(--chocolate)] md:text-5xl">
          Seu horário, em poucos cliques
        </h2>
        <p className="mt-5 max-w-xl text-[var(--muted)] leading-relaxed">
          Escolha o serviço, a profissional e o horário. Recebemos seu pedido
          na hora — sem depender de plataformas externas.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/agendar" className="btn-primary">
            Abrir agenda
          </Link>
          <a
            href={whatsappLink(
              brand.whatsapp,
              "Olá! Gostaria de agendar um horário na Lívia Sodré.",
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}
