"use client";

import { useMemo } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/lib/types";
import { categoryColors } from "@/lib/calendar/config";
import { isToday, monthGrid } from "@/lib/calendar/time";
import { useCalendarStore } from "@/store/calendar-store";
import { cn } from "@/lib/utils";

export function MonthView({ items }: { items: Appointment[] }) {
  const cursor = useCalendarStore((s) => s.cursor);
  const setCursor = useCalendarStore((s) => s.setCursor);
  const setView = useCalendarStore((s) => s.setView);
  const select = useCalendarStore((s) => s.select);
  const openCreate = useCalendarStore((s) => s.openCreate);
  const days = useMemo(() => monthGrid(cursor), [cursor]);
  const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/35 backdrop-blur">
      <div className="grid grid-cols-7 border-b border-white/40">
        {weekLabels.map((l) => (
          <div
            key={l}
            className="px-2 py-2 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"
          >
            {l}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((d) => {
          const dayItems = items
            .filter((a) => format(parseISO(a.startsAt), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"))
            .slice(0, 4);
          const extra =
            items.filter(
              (a) =>
                format(parseISO(a.startsAt), "yyyy-MM-dd") ===
                format(d, "yyyy-MM-dd"),
            ).length - dayItems.length;

          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-[88px] border-b border-r border-white/30 p-1.5 transition hover:bg-white/40",
                !isSameMonth(d, cursor) && "bg-black/[0.02] opacity-55",
                isToday(d) && "bg-[rgba(184,149,106,0.1)]",
              )}
              onClick={() => {
                setCursor(d);
                openCreate({ startsAt: d.toISOString(), durationMin: 60 });
              }}
              onDoubleClick={() => {
                setCursor(d);
                setView("day");
              }}
            >
              <button
                type="button"
                className={cn(
                  "mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs",
                  isToday(d) && "bg-[var(--chocolate)] text-[var(--cream)]",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCursor(d);
                  setView("day");
                }}
              >
                {format(d, "d")}
              </button>
              <div className="space-y-0.5">
                {dayItems.map((apt) => {
                  const c = categoryColors[apt.category] || categoryColors.facial;
                  return (
                    <button
                      key={apt.id}
                      type="button"
                      className="block w-full truncate rounded px-1 py-0.5 text-left text-[10px]"
                      style={{ background: c.bg, color: c.text, borderLeft: `2px solid ${c.border}` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        select(apt.id);
                      }}
                    >
                      {format(parseISO(apt.startsAt), "HH:mm", { locale: ptBR })}{" "}
                      {apt.clientName}
                    </button>
                  );
                })}
                {extra > 0 && (
                  <p className="px-1 text-[9px] text-[var(--muted)]">+{extra} mais</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaListView({ items }: { items: Appointment[] }) {
  const select = useCalendarStore((s) => s.select);
  const setContextMenu = useCalendarStore((s) => s.setContextMenu);
  const sorted = [...items].sort(
    (a, b) => +parseISO(a.startsAt) - +parseISO(b.startsAt),
  );

  const groups = sorted.reduce<Record<string, Appointment[]>>((acc, a) => {
    const key = format(parseISO(a.startsAt), "yyyy-MM-dd");
    (acc[key] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div className="cal-scroll h-full space-y-6 overflow-auto rounded-2xl border border-white/40 bg-white/35 p-4 backdrop-blur md:p-6">
      {Object.keys(groups).length === 0 && (
        <p className="text-sm text-[var(--muted)]">Nenhum agendamento neste filtro.</p>
      )}
      {Object.entries(groups).map(([day, list]) => (
        <section key={day}>
          <h3 className="display text-xl text-[var(--chocolate)]">
            {format(parseISO(day), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          <ul className="mt-3 space-y-2">
            {list.map((apt) => {
              const c = categoryColors[apt.category] || categoryColors.facial;
              return (
                <li key={apt.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 rounded-xl border border-white/50 bg-white/40 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderLeft: `4px solid ${c.border}` }}
                    onClick={() => select(apt.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, id: apt.id });
                    }}
                  >
                    <div className="w-16 shrink-0 text-xs text-[var(--gold-dim)]">
                      {format(parseISO(apt.startsAt), "HH:mm")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--chocolate)]">
                        {apt.clientName}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {apt.serviceName} · {apt.professionalName} · {apt.roomName}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] uppercase"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {c.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
