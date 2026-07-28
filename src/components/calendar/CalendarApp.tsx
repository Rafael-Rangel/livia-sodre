"use client";

import { useEffect, useMemo } from "react";
import { useCalendarStore } from "@/store/calendar-store";
import { filterAppointments } from "@/lib/calendar/filters";
import {
  CalendarFiltersPanel,
  CalendarMetricsBar,
  CalendarToolbar,
} from "./CalendarChrome";
import { WeekView, DayView } from "./WeekDayViews";
import { MonthView, AgendaListView } from "./MonthAgendaViews";
import { EventDrawer } from "./EventDrawer";
import { EventFormModal } from "./EventFormModal";
import { CalendarContextMenu } from "./CalendarContextMenu";

export function CalendarApp() {
  const load = useCalendarStore((s) => s.load);
  const view = useCalendarStore((s) => s.view);
  const appointments = useCalendarStore((s) => s.appointments);
  const filters = useCalendarStore((s) => s.filters);
  const loading = useCalendarStore((s) => s.loading);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = useMemo(
    () => filterAppointments(appointments, filters),
    [appointments, filters],
  );

  return (
    <div className="cal-app flex min-h-[calc(100vh-5rem)] flex-col gap-4">
      <CalendarToolbar />
      <CalendarMetricsBar />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[240px_1fr]">
        <div className="hidden xl:block">
          <CalendarFiltersPanel />
        </div>

        <div className="relative min-h-[640px] min-w-0">
          {loading && appointments.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
              Carregando agenda...
            </div>
          ) : (
            <>
              {view === "week" && <WeekView items={filtered} />}
              {view === "day" && <DayView items={filtered} />}
              {view === "month" && <MonthView items={filtered} />}
              {view === "agenda" && <AgendaListView items={filtered} />}
            </>
          )}
        </div>
      </div>

      {/* mobile filters */}
      <details className="xl:hidden">
        <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-[var(--gold-dim)]">
          Filtros
        </summary>
        <div className="mt-3">
          <CalendarFiltersPanel />
        </div>
      </details>

      <EventDrawer />
      <EventFormModal />
      <CalendarContextMenu />
    </div>
  );
}
