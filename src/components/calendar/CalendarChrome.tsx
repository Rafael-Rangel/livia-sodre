"use client";

import { addDays, addMonths, addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { team } from "@/data/team";
import { categoryLabels, type ServiceCategory } from "@/data/services";
import { rooms, statusMeta } from "@/lib/calendar/config";
import type { CalendarStatus, CalendarView } from "@/lib/types";
import { nowInClinic } from "@/lib/calendar/time";
import { useCalendarStore } from "@/store/calendar-store";
import { formatPrice } from "@/data/services";
import {
  Bell,
  CalendarDays,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const views: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Mês" },
  { id: "week", label: "Semana" },
  { id: "day", label: "Dia" },
  { id: "agenda", label: "Agenda" },
];

export function CalendarToolbar() {
  const view = useCalendarStore((s) => s.view);
  const setView = useCalendarStore((s) => s.setView);
  const cursor = useCalendarStore((s) => s.cursor);
  const setCursor = useCalendarStore((s) => s.setCursor);
  const zoom = useCalendarStore((s) => s.zoom);
  const setZoom = useCalendarStore((s) => s.setZoom);
  const openCreate = useCalendarStore((s) => s.openCreate);
  const filters = useCalendarStore((s) => s.filters);
  const setFilters = useCalendarStore((s) => s.setFilters);
  const notifications = useCalendarStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  function shift(dir: -1 | 1) {
    if (view === "month") setCursor(addMonths(cursor, dir));
    else if (view === "week") setCursor(addWeeks(cursor, dir));
    else setCursor(addDays(cursor, dir));
  }

  const title =
    view === "month"
      ? format(cursor, "MMMM yyyy", { locale: ptBR })
      : view === "week"
        ? `Semana de ${format(cursor, "d MMM", { locale: ptBR })}`
        : format(cursor, "d 'de' MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-xs uppercase tracking-[0.12em]"
            onClick={() => setCursor(nowInClinic())}
          >
            Hoje
          </button>
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-white/50" onClick={() => shift(-1)}>
            ‹
          </button>
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-white/50" onClick={() => shift(1)}>
            ›
          </button>
          <h1 className="display ml-1 text-2xl capitalize text-[var(--chocolate)] md:text-3xl">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(view === "week" || view === "day") && (
            <div className="flex items-center gap-1 rounded-xl border border-white/50 bg-white/40 px-1">
              <button type="button" className="p-2" onClick={() => setZoom(zoom - 8)} aria-label="Zoom out">
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] text-[var(--muted)]">{zoom}px</span>
              <button type="button" className="p-2" onClick={() => setZoom(zoom + 8)} aria-label="Zoom in">
                <ZoomIn size={14} />
              </button>
            </div>
          )}
          <div className="relative">
            <Bell size={16} className="text-[var(--gold-dim)]" />
            {unread > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
                {unread}
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn-primary inline-flex !items-center gap-1.5 !px-3 !py-2 !text-[10px]"
            onClick={() => openCreate()}
          >
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-white/50 bg-white/40 p-1">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition",
                view === v.id
                  ? "bg-[var(--chocolate)] text-[var(--cream)]"
                  : "text-[var(--muted)] hover:bg-white/70",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[180px] flex-1 md:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder="Busca global..."
            className="w-full rounded-xl border border-white/50 bg-white/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
      </div>
    </div>
  );
}

export function CalendarFiltersPanel() {
  const filters = useCalendarStore((s) => s.filters);
  const setFilters = useCalendarStore((s) => s.setFilters);

  function togglePro(id: string) {
    const has = filters.professionalIds.includes(id);
    setFilters({
      professionalIds: has
        ? filters.professionalIds.filter((x) => x !== id)
        : [...filters.professionalIds, id],
    });
  }

  function toggleRoom(id: string) {
    const has = filters.roomIds.includes(id);
    setFilters({
      roomIds: has
        ? filters.roomIds.filter((x) => x !== id)
        : [...filters.roomIds, id],
    });
  }

  function toggleCat(cat: ServiceCategory) {
    const has = filters.categories.includes(cat);
    setFilters({
      categories: has
        ? filters.categories.filter((x) => x !== cat)
        : [...filters.categories, cat],
    });
  }

  function toggleStatus(st: CalendarStatus) {
    const has = filters.statuses.includes(st);
    setFilters({
      statuses: has
        ? filters.statuses.filter((x) => x !== st)
        : [...filters.statuses, st],
    });
  }

  return (
    <aside className="cal-scroll max-h-[calc(100vh-8rem)] space-y-5 overflow-x-hidden overflow-y-auto rounded-2xl border border-white/40 bg-white/35 p-4 backdrop-blur">
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Período
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(
            [
              ["all", "Todos"],
              ["today", "Hoje"],
              ["tomorrow", "Amanhã"],
              ["week", "Semana"],
              ["month", "Mês"],
              ["future", "Futuros"],
              ["past", "Passados"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilters({ datePreset: id })}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide",
                filters.datePreset === id
                  ? "bg-[var(--chocolate)] text-[var(--cream)]"
                  : "bg-white/50 text-[var(--muted)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Profissionais
        </p>
        <div className="mt-2 space-y-1">
          {team.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-white/40"
            >
              <input
                type="checkbox"
                checked={
                  filters.professionalIds.length === 0 ||
                  filters.professionalIds.includes(p.id)
                }
                onChange={() => togglePro(p.id)}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-6 w-6 rounded-full object-cover" />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Salas
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rooms.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggleRoom(r.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px]",
                filters.roomIds.includes(r.id)
                  ? "bg-[var(--chocolate)] text-[var(--cream)]"
                  : "bg-white/50 text-[var(--muted)]",
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Categorias
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(Object.keys(categoryLabels) as ServiceCategory[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCat(c)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px]",
                filters.categories.includes(c)
                  ? "bg-[var(--chocolate)] text-[var(--cream)]"
                  : "bg-white/50 text-[var(--muted)]",
              )}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Status
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(Object.keys(statusMeta) as CalendarStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px]",
                filters.statuses.includes(s)
                  ? "text-white"
                  : "bg-white/50 text-[var(--muted)]",
              )}
              style={
                filters.statuses.includes(s)
                  ? { background: statusMeta[s].color }
                  : undefined
              }
            >
              {statusMeta[s].label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="text-[10px] uppercase tracking-[0.14em] text-[var(--gold-dim)]"
        onClick={() =>
          setFilters({
            query: "",
            professionalIds: [],
            roomIds: [],
            categories: [],
            statuses: [],
            paymentMethods: [],
            datePreset: "all",
          })
        }
      >
        Limpar filtros
      </button>
    </aside>
  );
}

export function CalendarMetricsBar() {
  const metrics = useCalendarStore((s) => s.metrics);
  if (!metrics) return null;
  const cards = [
    { label: "Hoje", value: String(metrics.todayCount), icon: CalendarDays },
    { label: "Previsto", value: formatPrice(metrics.expectedRevenue) },
    { label: "Realizado", value: formatPrice(metrics.realizedRevenue) },
    { label: "Confirmados", value: String(metrics.confirmed) },
    { label: "Pendentes", value: String(metrics.pending) },
    { label: "Em atendimento", value: String(metrics.inProgress) },
    { label: "Livres (est.)", value: String(metrics.freeHint) },
    { label: "Ocupação", value: `${metrics.occupancy}%` },
    { label: "Tempo médio", value: `${metrics.avgDuration} min` },
    { label: "Top profissional", value: metrics.topPro },
    { label: "Top procedimento", value: metrics.topSvc },
  ];
  return (
    <div className="cal-scroll flex flex-wrap gap-2 overflow-x-hidden pb-1">
      {cards.map((c) => (
        <div
          key={c.label}
          className="min-w-[120px] shrink-0 rounded-xl border border-white/45 bg-white/45 px-3 py-2 backdrop-blur transition hover:-translate-y-0.5"
        >
          <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {c.label}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-[var(--chocolate)]">
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
