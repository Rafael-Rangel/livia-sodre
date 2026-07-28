"use client";

import { useMemo, useRef } from "react";
import { addMinutes, format, isSameDay, parseISO, setHours, setMinutes, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "@/lib/types";
import { businessHours } from "@/lib/calendar/config";
import {
  fromClinicLocal,
  isToday,
  minutesFromOpen,
  snapMinutes,
  totalDayMinutes,
  weekDays,
} from "@/lib/calendar/time";
import {
  layoutOverlappingEvents,
  overlapStyle,
} from "@/lib/calendar/layout";
import { useCalendarStore } from "@/store/calendar-store";
import { EventCard } from "./EventCard";
import { CurrentTimeLine, HourGrid, HourLabels } from "./TimeGrid";
import { cn } from "@/lib/utils";

function useDragResize() {
  const patch = useCalendarStore((s) => s.patch);
  const zoom = useCalendarStore((s) => s.zoom);

  function startMove(apt: Appointment, e: React.PointerEvent, dayEl: HTMLElement | null) {
    if ((e.target as HTMLElement).closest("[data-resize]")) return;
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startX = e.clientX;
    const origStart = parseISO(apt.startsAt);
    const dayWidth = dayEl?.parentElement
      ? dayEl.parentElement.clientWidth / 7
      : 120;
    let moved = false;
    let lastStarts = apt.startsAt;

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      const dx = ev.clientX - startX;
      if (Math.abs(dy) + Math.abs(dx) < 6) return;
      moved = true;
      const deltaMin =
        Math.round(((dy / zoom) * 60) / businessHours.slotMinutes) *
        businessHours.slotMinutes;
      const dayDelta = Math.round(dx / dayWidth);
      let next = addMinutes(origStart, deltaMin);
      if (dayDelta) next = addMinutes(next, dayDelta * 24 * 60);
      next = snapMinutes(next);
      lastStarts = fromClinicLocal(next).toISOString();
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (moved && lastStarts !== apt.startsAt) {
        void patch(apt.id, { startsAt: lastStarts });
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startResize(apt: Appointment, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const orig = apt.durationMin;
    let durationMin = orig;
    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      const delta =
        Math.round(((dy / zoom) * 60) / businessHours.slotMinutes) *
        businessHours.slotMinutes;
      durationMin = Math.max(businessHours.slotMinutes * 2, orig + delta);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (durationMin !== orig) void patch(apt.id, { durationMin });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return { startMove, startResize };
}

export function WeekView({ items }: { items: Appointment[] }) {
  const cursor = useCalendarStore((s) => s.cursor);
  const zoom = useCalendarStore((s) => s.zoom);
  const select = useCalendarStore((s) => s.select);
  const openCreate = useCalendarStore((s) => s.openCreate);
  const setContextMenu = useCalendarStore((s) => s.setContextMenu);
  const days = useMemo(() => weekDays(cursor), [cursor]);
  const height = (totalDayMinutes() / 60) * zoom;
  const { startMove, startResize } = useDragResize();
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  function slotClick(day: Date, e: React.MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const mins = Math.round((y / zoom) * 60 / businessHours.slotMinutes) * businessHours.slotMinutes;
    const base = setMinutes(
      setHours(startOfDay(day), businessHours.openHour),
      businessHours.openMinute,
    );
    const starts = snapMinutes(addMinutes(base, mins));
    openCreate({
      startsAt: fromClinicLocal(starts).toISOString(),
      durationMin: 60,
    });
  }

  return (
    <div className="cal-scroll flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto rounded-2xl border border-white/40 bg-white/35 backdrop-blur">
      <div className="sticky top-0 z-30 flex border-b border-white/50 bg-[rgba(250,246,240,0.92)] backdrop-blur">
        <div className="w-14 shrink-0" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cn(
              "flex-1 border-l border-white/40 px-2 py-3 text-center",
              isToday(d) && "bg-[rgba(184,149,106,0.12)]",
            )}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {format(d, "EEE", { locale: ptBR })}
            </p>
            <p
              className={cn(
                "display mx-auto mt-1 flex h-8 w-8 items-center justify-center text-lg",
                isToday(d) &&
                  "rounded-full bg-[var(--chocolate)] text-[var(--cream)]",
              )}
            >
              {format(d, "d")}
            </p>
          </div>
        ))}
      </div>

      <div className="relative flex" style={{ height }}>
        <HourLabels zoom={zoom} />
        <div className="relative flex min-w-0 flex-1">
          {days.map((d, i) => {
            const dayItems = items.filter((a) =>
              isSameDay(parseISO(a.startsAt), d),
            );
            return (
              <div
                key={d.toISOString()}
                ref={(el) => {
                  colRefs.current[i] = el;
                }}
                className={cn(
                  "relative flex-1 border-l border-white/40",
                  isToday(d) && "bg-[rgba(184,149,106,0.04)]",
                )}
                style={{ height }}
                onClick={(e) => slotClick(d, e)}
              >
                <HourGrid zoom={zoom} />
                <CurrentTimeLine day={d} zoom={zoom} />
                {layoutOverlappingEvents(dayItems).map(({ apt, column, columns }) => {
                  const top = (minutesFromOpen(parseISO(apt.startsAt)) / 60) * zoom;
                  const h = Math.max(22, (apt.durationMin / 60) * zoom);
                  return (
                    <EventCard
                      key={apt.id}
                      apt={apt}
                      compact={h < 48 || columns > 2}
                      showResize
                      style={{
                        top,
                        height: h,
                        ...overlapStyle(column, columns),
                        zIndex: 10 + column,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        select(apt.id);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, id: apt.id });
                      }}
                      onPointerDown={(e) => {
                        if (e.button !== 0) return;
                        startMove(apt, e, colRefs.current[i]);
                      }}
                      onResizeStart={(e) => startResize(apt, e)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DayView({ items }: { items: Appointment[] }) {
  const cursor = useCalendarStore((s) => s.cursor);
  const zoom = useCalendarStore((s) => s.zoom);
  const select = useCalendarStore((s) => s.select);
  const openCreate = useCalendarStore((s) => s.openCreate);
  const setContextMenu = useCalendarStore((s) => s.setContextMenu);
  const height = (totalDayMinutes() / 60) * zoom;
  const { startMove, startResize } = useDragResize();
  const colRef = useRef<HTMLDivElement | null>(null);
  const laidOut = useMemo(() => {
    const dayItems = items.filter((a) => isSameDay(parseISO(a.startsAt), cursor));
    return layoutOverlappingEvents(dayItems);
  }, [items, cursor]);

  return (
    <div className="cal-scroll h-full overflow-x-hidden overflow-y-auto rounded-2xl border border-white/40 bg-white/35 backdrop-blur">
      <div className="sticky top-0 z-30 border-b border-white/50 bg-[rgba(250,246,240,0.92)] px-4 py-3 backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {format(cursor, "EEEE", { locale: ptBR })}
        </p>
        <p
          className={cn(
            "display mt-1 text-2xl",
            isToday(cursor) && "text-[var(--gold-dim)]",
          )}
        >
          {format(cursor, "d 'de' MMMM yyyy", { locale: ptBR })}
        </p>
      </div>
      <div className="relative flex" style={{ height }}>
        <HourLabels zoom={zoom} />
        <div
          ref={colRef}
          className="relative min-w-0 flex-1"
          style={{ height }}
          onClick={(e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const mins =
              Math.round((y / zoom) * 60 / businessHours.slotMinutes) *
              businessHours.slotMinutes;
            const base = setMinutes(
              setHours(startOfDay(cursor), businessHours.openHour),
              businessHours.openMinute,
            );
            openCreate({
              startsAt: fromClinicLocal(snapMinutes(addMinutes(base, mins))).toISOString(),
              durationMin: 60,
            });
          }}
        >
          <HourGrid zoom={zoom} />
          <CurrentTimeLine day={cursor} zoom={zoom} />
          {laidOut.map(({ apt, column, columns }) => {
            const top = (minutesFromOpen(parseISO(apt.startsAt)) / 60) * zoom;
            const h = Math.max(22, (apt.durationMin / 60) * zoom);
            return (
              <EventCard
                key={apt.id}
                apt={apt}
                compact={h < 48 || columns > 3}
                showResize
                style={{
                  top,
                  height: h,
                  ...overlapStyle(column, columns),
                  zIndex: 10 + column,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  select(apt.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ x: e.clientX, y: e.clientY, id: apt.id });
                }}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  startMove(apt, e, colRef.current);
                }}
                onResizeStart={(e) => startResize(apt, e)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
