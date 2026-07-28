"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  services,
  categoryLabels,
  formatPrice,
  type ServiceCategory,
} from "@/data/services";
import { team } from "@/data/team";
import { rooms, statusMeta } from "@/lib/calendar/config";
import type { Appointment, CalendarStatus } from "@/lib/types";
import { useCalendarStore } from "@/store/calendar-store";
import { X } from "lucide-react";

const grouped = (Object.keys(categoryLabels) as ServiceCategory[]).map(
  (cat) => ({
    cat,
    label: categoryLabels[cat],
    items: services.filter((s) => s.category === cat),
  }),
);

export function EventFormModal() {
  const open = useCalendarStore((s) => s.formOpen);
  const mode = useCalendarStore((s) => s.formMode);
  const defaults = useCalendarStore((s) => s.formDefaults);
  const closeForm = useCalendarStore((s) => s.closeForm);
  const save = useCalendarStore((s) => s.save);
  const appointments = useCalendarStore((s) => s.appointments);

  const clients = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email: string }>();
    appointments.forEach((a) => {
      map.set(a.clientPhone, {
        name: a.clientName,
        phone: a.clientPhone,
        email: a.clientEmail,
      });
    });
    return [...map.values()];
  }, [appointments]);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [durationMin, setDurationMin] = useState(60);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<CalendarStatus>("scheduled");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [clientQuery, setClientQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const d = defaults;
    const svc = services.find((s) => s.id === d?.serviceId) || services[0];
    const start = d?.startsAt ? parseISO(d.startsAt) : new Date();
    setClientName(d?.clientName || "");
    setClientPhone(d?.clientPhone || "");
    setClientEmail(d?.clientEmail || "");
    setServiceId(svc.id);
    setProfessionalId(d?.professionalId || team[0]?.id || "livia");
    setRoomId(d?.roomId || rooms[0].id);
    setDate(format(start, "yyyy-MM-dd"));
    setTime(format(start, "HH:mm"));
    setDurationMin(d?.durationMin || svc.durationMin);
    setPrice(d?.price ?? svc.priceFrom);
    setStatus((d?.status as CalendarStatus) || "scheduled");
    setNotes(d?.notes || "");
    setPaymentMethod(d?.paymentMethod || "PIX");
    setClientQuery("");
  }, [open, defaults]);

  function onServiceChange(id: string) {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    if (svc) {
      setDurationMin(svc.durationMin);
      setPrice(svc.priceFrom);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const svc = services.find((s) => s.id === serviceId);
    const pro = team.find((p) => p.id === professionalId);
    const room = rooms.find((r) => r.id === roomId);
    if (!svc || !pro || !room) return;
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    const payload: Partial<Appointment> & { id?: string } = {
      id: mode !== "create" ? defaults?.id : undefined,
      clientName,
      clientPhone,
      clientEmail,
      serviceId: svc.id,
      serviceName: svc.name,
      category: svc.category,
      professionalId: pro.id,
      professionalName: pro.name,
      roomId: room.id,
      roomName: room.name,
      startsAt,
      durationMin,
      price,
      status: mode === "reschedule" ? "rescheduled" : status,
      notes,
      paymentMethod,
    };
    await save(payload);
  }

  const filteredClients = clients.filter(
    (c) =>
      !clientQuery ||
      c.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
      c.phone.includes(clientQuery),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForm}
            aria-label="Fechar"
          />
          <motion.div
            role="dialog"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[min(560px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/40 bg-[rgba(250,246,240,0.98)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <h2 className="display text-2xl text-[var(--chocolate)]">
                {mode === "create"
                  ? "Novo agendamento"
                  : mode === "reschedule"
                    ? "Remarcar"
                    : "Editar agendamento"}
              </h2>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 hover:bg-black/5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="max-h-[calc(90vh-64px)] space-y-4 overflow-y-auto px-5 py-5">
              <fieldset>
                <legend className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  Cliente
                </legend>
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Buscar cliente existente..."
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                />
                {clientQuery && filteredClients.length > 0 && (
                  <ul className="mt-1 max-h-28 overflow-auto rounded-xl border border-[var(--line)] bg-white">
                    {filteredClients.slice(0, 6).map((c) => (
                      <li key={c.phone}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--nude)]"
                          onClick={() => {
                            setClientName(c.name);
                            setClientPhone(c.phone);
                            setClientEmail(c.email);
                            setClientQuery("");
                          }}
                        >
                          {c.name} · {c.phone}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nome"
                    className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                  />
                  <input
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Telefone / WhatsApp"
                    className="rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="E-mail (opcional)"
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                />
              </fieldset>

              <fieldset>
                <legend className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  Procedimento
                </legend>
                <select
                  value={serviceId}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none"
                >
                  {grouped.map(({ cat, label, items }) => (
                    <optgroup key={cat} label={label}>
                      {items.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {formatPrice(s.priceFrom)} · {s.durationMin}min
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Profissional
                  </span>
                  <select
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  >
                    {team.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Sala
                  </span>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Data
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Hora
                  </span>
                  <input
                    type="time"
                    required
                    step={300}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Duração (min)
                  </span>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Valor (R$)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  >
                    {(Object.keys(statusMeta) as CalendarStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {statusMeta[k].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    Pagamento
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm"
                  >
                    {["PIX", "Cartão", "Dinheiro", "Transferência", "A definir"].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações"
                className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />

              <button type="submit" className="btn-primary w-full">
                {mode === "create" ? "Criar agendamento" : "Salvar alterações"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
