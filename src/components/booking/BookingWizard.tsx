"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { services, formatPrice, formatDuration } from "@/data/services";
import { team } from "@/data/team";
import { brand } from "@/data/content";
import { whatsappLink } from "@/lib/utils";

const steps = ["Serviço", "Profissional", "Horário", "Dados"];

function slotsForDay(base: Date) {
  const hours = [9, 10, 11, 14, 15, 16, 17];
  return hours.map((h) => setMinutes(setHours(base, h), 0));
}

export function BookingWizard() {
  const params = useSearchParams();
  const initialService = params.get("servico") || "";

  const [step, setStep] = useState(initialService ? 1 : 0);
  const [serviceId, setServiceId] = useState(initialService);
  const [professionalId, setProfessionalId] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [startsAt, setStartsAt] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === serviceId);
  const professional = team.find((p) => p.id === professionalId);
  const day = addDays(new Date(), dayOffset);
  const slots = useMemo(() => slotsForDay(day), [day]);

  async function submit() {
    if (!service || !professional || !startsAt) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          clientPhone: phone,
          clientEmail: email,
          serviceId: service.id,
          serviceName: service.name,
          professionalId: professional.id,
          professionalName: professional.name,
          startsAt,
          durationMin: service.durationMin,
          price: service.priceFrom,
          notes,
          paymentMethod: "A definir na clínica",
        }),
      });
      if (!res.ok) throw new Error("Falha ao agendar");
      const data = await res.json();
      setDone({ id: data.id });
    } catch {
      setError("Não foi possível concluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done && service && professional) {
    const wa = whatsappLink(
      brand.whatsapp,
      `Olá! Acabei de agendar pelo site.\nServiço: ${service.name}\nProfissional: ${professional.name}\nHorário: ${format(new Date(startsAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\nNome: ${name}\nProtocolo: ${done.id}`,
    );
    return (
      <div className="mx-auto max-w-xl border border-[var(--line)] bg-white/40 p-8 text-center">
        <p className="eyebrow text-[var(--gold-dim)]">Agendamento enviado</p>
        <h2 className="script mt-3 text-5xl text-[var(--gold)]">Perfeito!</h2>
        <p className="mt-4 text-[var(--muted)]">
          Recebemos seu pedido. Em breve confirmamos pelo WhatsApp.
        </p>
        <p className="mt-6 text-sm text-[var(--brown)]">
          Protocolo <strong>{done.id}</strong>
        </p>
        <a href={wa} target="_blank" rel="noreferrer" className="btn-primary mt-8 inline-flex">
          Confirmar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-center justify-between gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={
                i <= step
                  ? "flex h-8 w-8 items-center justify-center bg-[var(--chocolate)] text-xs text-[var(--cream)]"
                  : "flex h-8 w-8 items-center justify-center border border-[var(--line)] text-xs text-[var(--muted)]"
              }
            >
              {i + 1}
            </div>
            <span className="hidden text-[10px] tracking-[0.14em] uppercase text-[var(--muted)] sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(1);
                  }}
                  className="border border-[var(--line)] bg-white/30 p-4 text-left transition hover:border-[var(--gold)]"
                >
                  <p className="display text-lg text-[var(--chocolate)]">
                    {s.name}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {formatDuration(s.durationMin)} · a partir de{" "}
                    {formatPrice(s.priceFrom)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {team.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProfessionalId(p.id);
                    setStep(2);
                  }}
                  className="flex gap-4 border border-[var(--line)] bg-white/30 p-4 text-left transition hover:border-[var(--gold)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <span>
                    <span className="script block text-3xl text-[var(--gold)]">
                      {p.name}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {p.role}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const d = addDays(new Date(), offset);
                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => setDayOffset(offset)}
                      className={
                        dayOffset === offset
                          ? "bg-[var(--chocolate)] px-3 py-2 text-xs text-[var(--cream)]"
                          : "border border-[var(--line)] px-3 py-2 text-xs text-[var(--brown)]"
                      }
                    >
                      {format(d, "EEE dd/MM", { locale: ptBR })}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {slots.map((slot) => {
                  const iso = slot.toISOString();
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setStartsAt(iso);
                        setStep(3);
                      }}
                      className="border border-[var(--line)] bg-white/40 py-3 text-sm text-[var(--chocolate)] hover:border-[var(--gold)]"
                    >
                      {format(slot, "HH:mm")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 border border-[var(--line)] bg-white/40 p-6">
              <p className="text-sm text-[var(--muted)]">
                {service?.name} · {professional?.name} ·{" "}
                {startsAt &&
                  format(new Date(startsAt), "dd/MM 'às' HH:mm", {
                    locale: ptBR,
                  })}
              </p>
              <input
                className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                placeholder="WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                placeholder="E-mail (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className="min-h-24 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                placeholder="Observações"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button
                type="button"
                disabled={loading || name.length < 2 || phone.length < 8}
                onClick={submit}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Confirmar agendamento"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 0 && !done && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-6 text-xs tracking-[0.16em] uppercase text-[var(--muted)]"
        >
          Voltar
        </button>
      )}
    </div>
  );
}
