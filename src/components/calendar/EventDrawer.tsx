"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice, formatDuration } from "@/data/services";
import {
  categoryColors,
  normalizeStatus,
  statusMeta,
} from "@/lib/calendar/config";
import { formatTimeRange, whatsappUrl } from "@/lib/calendar/time";
import { useCalendarStore } from "@/store/calendar-store";
import {
  CalendarCheck,
  CheckCircle2,
  Copy,
  MessageCircle,
  Phone,
  User,
  X,
  XCircle,
} from "lucide-react";

export function EventDrawer() {
  const selectedId = useCalendarStore((s) => s.selectedId);
  const appointments = useCalendarStore((s) => s.appointments);
  const select = useCalendarStore((s) => s.select);
  const openEdit = useCalendarStore((s) => s.openEdit);
  const patch = useCalendarStore((s) => s.patch);
  const remove = useCalendarStore((s) => s.remove);
  const apt = appointments.find((a) => a.id === selectedId) || null;

  async function copyInfo() {
    if (!apt) return;
    const text = [
      apt.clientName,
      apt.clientPhone,
      apt.serviceName,
      apt.professionalName,
      apt.roomName,
      format(parseISO(apt.startsAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      formatPrice(apt.price),
    ].join(" · ");
    await navigator.clipboard.writeText(text);
  }

  return (
    <AnimatePresence>
      {apt && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => select(null)}
          />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/30 bg-[rgba(250,246,240,0.96)] shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--nude)] text-[var(--gold-dim)]">
                  {apt.clientPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={apt.clientPhoto}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div>
                  <h2 className="display text-2xl text-[var(--chocolate)]">
                    {apt.clientName}
                  </h2>
                  <p className="text-xs text-[var(--muted)]">{apt.serviceName}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-black/5"
                onClick={() => select(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-5 py-5 text-sm">
              {(() => {
                const c = categoryColors[apt.category];
                const st = normalizeStatus(apt.status);
                return (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide"
                        style={{ background: c.bg, color: c.text }}
                      >
                        {c.label}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide"
                        style={{
                          background: statusMeta[st].bg,
                          color: statusMeta[st].color,
                        }}
                      >
                        {statusMeta[st].label}
                      </span>
                    </div>

                    <Row label="Telefone" value={apt.clientPhone} />
                    <Row label="WhatsApp" value={apt.clientPhone} />
                    <Row label="Procedimento" value={apt.serviceName} />
                    <Row label="Profissional" value={apt.professionalName} />
                    <Row label="Sala" value={apt.roomName} />
                    <Row
                      label="Data"
                      value={format(parseISO(apt.startsAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    />
                    <Row
                      label="Horário"
                      value={formatTimeRange(apt.startsAt, apt.durationMin)}
                    />
                    <Row label="Duração" value={formatDuration(apt.durationMin)} />
                    <Row label="Valor" value={formatPrice(apt.price)} />
                    <Row label="Pagamento" value={apt.paymentMethod} />
                    {apt.notes && <Row label="Observações" value={apt.notes} />}

                    {apt.history && apt.history.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                          Histórico do cliente
                        </p>
                        <ul className="mt-2 space-y-2">
                          {apt.history.map((h) => (
                            <li
                              key={h.id}
                              className="rounded-lg border border-[var(--line)] bg-white/50 px-3 py-2 text-xs"
                            >
                              {format(parseISO(h.date), "dd/MM/yyyy")} ·{" "}
                              {h.serviceName} · {h.professionalName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-[var(--line)] p-4">
              <Action onClick={() => openEdit(apt)}>Editar</Action>
              <Action onClick={() => openEdit(apt, "reschedule")}>Remarcar</Action>
              <Action
                onClick={() => patch(apt.id, { status: "confirmed" })}
                icon={<CalendarCheck size={14} />}
              >
                Confirmar
              </Action>
              <Action
                onClick={() =>
                  patch(apt.id, { status: "finished", paymentStatus: "paid" })
                }
                icon={<CheckCircle2 size={14} />}
              >
                Finalizar
              </Action>
              <Action
                onClick={() => patch(apt.id, { status: "cancelled" })}
                icon={<XCircle size={14} />}
                danger
              >
                Cancelar
              </Action>
              <Action onClick={() => remove(apt.id)} danger>
                Excluir
              </Action>
              <a
                href={whatsappUrl(
                  apt.clientPhone,
                  `Olá ${apt.clientName}! Sobre seu horário de ${apt.serviceName}...`,
                )}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 px-3 py-2.5 text-xs font-medium text-[#128C7E] transition hover:bg-[#25D366]/25"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <Action onClick={copyInfo} icon={<Copy size={14} />}>
                Copiar infos
              </Action>
              <a
                href={`tel:${apt.clientPhone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white/50 px-3 py-2.5 text-xs transition hover:bg-white"
              >
                <Phone size={14} /> Ligar
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-[var(--chocolate)]">{value}</p>
    </div>
  );
}

function Action({
  children,
  onClick,
  icon,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs transition ${
        danger
          ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
          : "border-[var(--line)] bg-white/50 text-[var(--chocolate)] hover:bg-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
