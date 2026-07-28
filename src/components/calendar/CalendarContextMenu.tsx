"use client";

import { useEffect, useRef } from "react";
import { useCalendarStore } from "@/store/calendar-store";
import { whatsappUrl } from "@/lib/calendar/time";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/data/services";

export function CalendarContextMenu() {
  const menu = useCalendarStore((s) => s.contextMenu);
  const setContextMenu = useCalendarStore((s) => s.setContextMenu);
  const appointments = useCalendarStore((s) => s.appointments);
  const openEdit = useCalendarStore((s) => s.openEdit);
  const duplicate = useCalendarStore((s) => s.duplicate);
  const patch = useCalendarStore((s) => s.patch);
  const remove = useCalendarStore((s) => s.remove);
  const select = useCalendarStore((s) => s.select);
  const ref = useRef<HTMLDivElement>(null);

  const apt = appointments.find((a) => a.id === menu?.id);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setContextMenu(null);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu, setContextMenu]);

  if (!menu || !apt) return null;

  const items: { label: string; action: () => void; danger?: boolean }[] = [
    {
      label: "Abrir",
      action: () => {
        select(apt.id);
        setContextMenu(null);
      },
    },
    {
      label: "Editar",
      action: () => {
        openEdit(apt);
        setContextMenu(null);
      },
    },
    {
      label: "Duplicar",
      action: () => {
        void duplicate(apt.id);
      },
    },
    {
      label: "Remarcar",
      action: () => {
        openEdit(apt, "reschedule");
        setContextMenu(null);
      },
    },
    {
      label: "Confirmar",
      action: () => {
        void patch(apt.id, { status: "confirmed" });
        setContextMenu(null);
      },
    },
    {
      label: "Cancelar",
      action: () => {
        void patch(apt.id, { status: "cancelled" });
        setContextMenu(null);
      },
      danger: true,
    },
    {
      label: "Excluir",
      action: () => {
        void remove(apt.id);
      },
      danger: true,
    },
    {
      label: "Enviar WhatsApp",
      action: () => {
        window.open(
          whatsappUrl(
            apt.clientPhone,
            `Olá ${apt.clientName}! Lembrete do seu horário.`,
          ),
          "_blank",
        );
        setContextMenu(null);
      },
    },
    {
      label: "Copiar",
      action: async () => {
        await navigator.clipboard.writeText(
          `${apt.clientName} · ${apt.serviceName} · ${format(parseISO(apt.startsAt), "dd/MM HH:mm", { locale: ptBR })} · ${formatPrice(apt.price)}`,
        );
        setContextMenu(null);
      },
    },
    {
      label: "Imprimir",
      action: () => {
        window.print();
        setContextMenu(null);
      },
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[80] min-w-[180px] overflow-hidden rounded-xl border border-white/50 bg-[rgba(250,246,240,0.98)] py-1 shadow-xl backdrop-blur"
      style={{ left: menu.x, top: menu.y }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`block w-full px-3 py-2 text-left text-xs transition hover:bg-white/80 ${
            item.danger ? "text-red-800" : "text-[var(--chocolate)]"
          }`}
          onClick={item.action}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
