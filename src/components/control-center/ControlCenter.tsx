"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Banknote,
  Bell,
  Brain,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Globe,
  GripVertical,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Moon,
  PieChart,
  Pin,
  RefreshCw,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  UserRound,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { formatPrice, services, type ServiceCategory } from "@/data/services";
import { categoryColors, normalizeStatus, statusMeta } from "@/lib/calendar/config";
import { categoryIcons } from "@/lib/icons";
import { formatTimeRange, nowInClinic } from "@/lib/calendar/time";
import type { ControlTab, WidgetId } from "@/lib/control-center/types";
import { CONTROL_TABS, useControlCenter } from "@/store/control-center-store";
import { KpiCard, WidgetShell } from "./KpiCard";
import { AnimatedNumber, Skeleton } from "./AnimatedNumber";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { cn } from "@/lib/utils";
import type { ControlCenterPayload } from "@/lib/control-center/metrics";

const kpiIcons: Record<string, LucideIcon> = {
  today: CalendarCheck,
  confirmed: CheckCircle2,
  pending: CalendarClock,
  in_progress: Activity,
  finished: CheckCircle2,
  cancelled: XCircle,
  expected: Wallet,
  received: Banknote,
  occupancy: TrendingUp,
  commission: Banknote,
  messages: Bell,
  avg: Clock,
};

const tabIcons: Record<ControlTab, LucideIcon> = {
  overview: LayoutDashboard,
  agenda: CalendarDays,
  team: Users,
  finance: Wallet,
  clients: UserRound,
  procedures: Sparkles,
  commercial: Target,
  notifications: Bell,
  insights: Brain,
  settings: Settings2,
};

const widgetIcons: Record<WidgetId, LucideIcon> = {
  kpis: LayoutGrid,
  agenda_today: CalendarDays,
  team_live: Users,
  finance_charts: Wallet,
  clients_pulse: UserRound,
  procedures_rank: Sparkles,
  commercial: Target,
  notifications: Bell,
  insights: Brain,
  occupancy: PieChart,
};

const financeKpiIcons: Record<string, LucideIcon> = {
  "Receita do dia": Wallet,
  "Receita da semana": CalendarDays,
  "Receita do mês": TrendingUp,
  "Receita anual": Banknote,
  "Contas a receber": CreditCard,
  "Contas a pagar": AlertTriangle,
  "Ticket médio": Target,
  "Comissões (est.)": Star,
};

const segmentIcons: Record<string, LucideIcon> = {
  novo: UserPlus,
  frequente: Users,
  vip: Star,
  inativo: Clock,
  aniversario: Gift,
};

function SortableWidget({
  id,
  span,
  edit,
  children,
}: {
  id: WidgetId;
  span: 1 | 2 | 3;
  edit: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !edit });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        span === 3 ? "md:col-span-3" : span === 2 ? "md:col-span-2" : "md:col-span-1",
        isDragging && "z-20 opacity-80",
      )}
    >
      <div className="relative">
        {edit && (
          <button
            type="button"
            className="absolute -left-1 top-3 z-10 rounded-md bg-white/80 p-1 shadow"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function ControlCenter() {
  const tab = useControlCenter((s) => s.tab);
  const setTab = useControlCenter((s) => s.setTab);
  const theme = useControlCenter((s) => s.theme);
  const toggleTheme = useControlCenter((s) => s.toggleTheme);
  const widgets = useControlCenter((s) => s.widgets);
  const editLayout = useControlCenter((s) => s.editLayout);
  const setEditLayout = useControlCenter((s) => s.setEditLayout);
  const reorderWidgets = useControlCenter((s) => s.reorderWidgets);
  const toggleWidget = useControlCenter((s) => s.toggleWidget);
  const togglePin = useControlCenter((s) => s.togglePin);
  const resetLayout = useControlCenter((s) => s.resetLayout);
  const data = useControlCenter((s) => s.data);
  const loading = useControlCenter((s) => s.loading);
  const load = useControlCenter((s) => s.load);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 45_000);
    return () => clearInterval(t);
  }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = widgets.map((w) => w.id);
    const oldIndex = ids.indexOf(active.id as WidgetId);
    const newIndex = ids.indexOf(over.id as WidgetId);
    reorderWidgets(arrayMove(ids, oldIndex, newIndex));
  }

  const visible = widgets.filter((w) => w.visible);

  return (
    <div className={cn("cc-root", theme === "dark" && "cc-dark")}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkles size={12} /> Centro de controle
          </p>
          <h1 className="display mt-2 text-4xl text-[var(--chocolate)] md:text-5xl">
            Clínica ao vivo
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {data?.meta.todayLabel || "Carregando…"} · timezone America/São_Paulo
            {data?.mock ? " · dados mock" : ""}
          </p>
        </motion.div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="cc-chip inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button type="button" onClick={toggleTheme} className="cc-chip inline-flex items-center gap-1.5">
            {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
            Tema
          </button>
          <button
            type="button"
            onClick={() => setEditLayout(!editLayout)}
            className={cn("cc-chip inline-flex items-center gap-1.5", editLayout && "cc-chip-active")}
          >
            <LayoutGrid size={13} />
            {editLayout ? "Concluir layout" : "Personalizar"}
          </button>
          {editLayout && (
            <button type="button" onClick={resetLayout} className="cc-chip">
              Restaurar padrão
            </button>
          )}
        </div>
      </header>

      <nav className="cc-tabs mb-6 flex flex-wrap gap-1 overflow-x-hidden pb-1">
        {CONTROL_TABS.map((t, i) => {
          const active = tab === t.id;
          const TabIcon = tabIcons[t.id];
          return (
            <motion.button
              key={t.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (t.href && t.id === "agenda") {
                  window.location.href = t.href;
                  return;
                }
                setTab(t.id);
              }}
              className={cn("cc-tab inline-flex items-center gap-1.5", active && "cc-tab-active")}
            >
              <TabIcon size={13} strokeWidth={1.8} />
              {t.label}
            </motion.button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {loading && !data ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
          ) : (
            <>
              {tab === "overview" && data && (
                <OverviewBoard
                  data={data}
                  visible={visible}
                  edit={editLayout}
                  sensors={sensors}
                  onDragEnd={onDragEnd}
                  onToggle={toggleWidget}
                  onPin={togglePin}
                  widgets={widgets}
                />
              )}
              {tab === "team" && data && <TeamBoard data={data} />}
              {tab === "finance" && data && <FinanceBoard data={data} />}
              {tab === "clients" && data && <ClientsBoard data={data} />}
              {tab === "procedures" && data && <ProceduresBoard data={data} />}
              {tab === "commercial" && data && <CommercialBoard data={data} />}
              {tab === "notifications" && data && <NotificationsBoard data={data} />}
              {tab === "insights" && data && <InsightsBoard data={data} />}
              {tab === "settings" && (
                <SettingsBoard
                  widgets={widgets}
                  onToggle={toggleWidget}
                  onPin={togglePin}
                  onReset={resetLayout}
                />
              )}
              {tab === "agenda" && (
                <WidgetShell title="Agenda completa" icon={CalendarDays}>
                  <p className="text-sm text-[var(--muted)]">
                    Abrindo o módulo de agenda estilo Google Calendar…
                  </p>
                  <Link href="/dashboard/agenda" className="btn-primary mt-4 inline-flex">
                    Ir para Agenda
                  </Link>
                </WidgetShell>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewBoard({
  data,
  visible,
  edit,
  sensors,
  onDragEnd,
  widgets,
  onToggle,
  onPin,
}: {
  data: ControlCenterPayload;
  visible: { id: WidgetId; span: 1 | 2 | 3; pinned: boolean; label: string }[];
  edit: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (e: DragEndEvent) => void;
  widgets: ReturnType<typeof useControlCenter.getState>["widgets"];
  onToggle: (id: WidgetId) => void;
  onPin: (id: WidgetId) => void;
}) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={visible.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-3">
          {visible.map((w, i) => (
            <SortableWidget key={w.id} id={w.id} span={w.span} edit={edit}>
              {w.id === "kpis" && (
                <WidgetShell
                  title="KPIs da clínica"
                  icon={widgetIcons.kpis}
                  delay={i * 0.04}
                  actions={
                    edit ? (
                      <button type="button" className="cc-mini" onClick={() => onPin(w.id)}>
                        <Pin size={12} />
                      </button>
                    ) : null
                  }
                >
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {data.kpis.map((k, idx) => (
                      <KpiCard
                        key={k.id}
                        {...k}
                        icon={kpiIcons[k.id]}
                        delay={0.05 + idx * 0.02}
                      />
                    ))}
                  </div>
                </WidgetShell>
              )}
              {w.id === "agenda_today" && <AgendaWidget data={data} delay={i * 0.04} />}
              {w.id === "insights" && <InsightsMini data={data} delay={i * 0.04} />}
              {w.id === "team_live" && <TeamMini data={data} delay={i * 0.04} />}
              {w.id === "occupancy" && <OccupancyWidget data={data} delay={i * 0.04} />}
              {w.id === "finance_charts" && <FinanceMini data={data} delay={i * 0.04} />}
              {w.id === "clients_pulse" && <ClientsMini data={data} delay={i * 0.04} />}
              {w.id === "procedures_rank" && <ProceduresMini data={data} delay={i * 0.04} />}
              {w.id === "commercial" && <CommercialMini data={data} delay={i * 0.04} />}
              {w.id === "notifications" && <NotifMini data={data} delay={i * 0.04} />}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
      {edit && (
        <div className="mt-4 flex flex-wrap gap-2">
          {widgets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onToggle(w.id)}
              className={cn("cc-chip", w.visible && "cc-chip-active")}
            >
              {w.visible ? "Ocultar" : "Mostrar"} · {w.label}
            </button>
          ))}
        </div>
      )}
    </DndContext>
  );
}

function AgendaWidget({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  const now = nowInClinic();
  return (
    <WidgetShell
      title="Agenda do dia"
      icon={widgetIcons.agenda_today}
      delay={delay}
      actions={
        <Link href="/dashboard/agenda" className="cc-mini">
          Abrir
        </Link>
      }
    >
      {data.nextAppointment && (
        <div className="mb-4 rounded-xl border border-[var(--gold)]/30 bg-[rgba(184,149,106,0.1)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--gold-dim)]">
            Próximo atendimento
          </p>
          <p className="mt-1 font-medium text-[var(--chocolate)]">
            {data.nextAppointment.clientName}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {data.nextAppointment.serviceName} ·{" "}
            {formatTimeRange(
              data.nextAppointment.startsAt,
              data.nextAppointment.durationMin,
            )}
          </p>
        </div>
      )}
      <ul className="relative max-h-80 space-y-2 overflow-x-hidden overflow-y-auto pr-1">
        <div className="absolute bottom-0 left-[15px] top-0 w-px bg-[rgba(44,31,26,0.08)]" />
        {data.dayAgenda.map((a) => {
          const st = normalizeStatus(a.status);
          const c = categoryColors[a.category];
          const past = parseISO(a.startsAt) < now;
          return (
            <li key={a.id} className="relative pl-8">
              <span
                className="absolute left-[10px] top-3 h-2.5 w-2.5 rounded-full"
                style={{ background: past ? "#ef4444" : c.border }}
              />
              <Link
                href="/dashboard/agenda"
                className="block rounded-xl border border-white/40 bg-white/40 px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderLeft: `3px solid ${c.border}` }}
              >
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--chocolate)]">
                    {a.clientName}
                  </p>
                  <span className="text-[10px] text-[var(--muted)]">
                    {format(parseISO(a.startsAt), "HH:mm")}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {a.serviceName} · {a.professionalName}
                </p>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] uppercase"
                  style={{ background: statusMeta[st].bg, color: statusMeta[st].color }}
                >
                  {statusMeta[st].label}
                </span>
              </Link>
            </li>
          );
        })}
        {data.dayAgenda.length === 0 && (
          <p className="pl-8 text-sm text-[var(--muted)]">Nenhum atendimento hoje.</p>
        )}
      </ul>
    </WidgetShell>
  );
}

function InsightsMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  return (
    <WidgetShell title="Insights IA" icon={widgetIcons.insights} delay={delay}>
      <ul className="space-y-2">
        {data.insights.slice(0, 4).map((ins) => {
          const SevIcon =
            ins.severity === "critical" || ins.severity === "warn"
              ? AlertTriangle
              : ins.severity === "success"
                ? CheckCircle2
                : Sparkles;
          return (
          <li
            key={ins.id}
            className={cn(
              "rounded-xl px-3 py-2 text-xs leading-relaxed",
              ins.severity === "critical" && "bg-red-50 text-red-900",
              ins.severity === "warn" && "bg-amber-50 text-amber-900",
              ins.severity === "success" && "bg-emerald-50 text-emerald-900",
              ins.severity === "info" && "bg-white/60 text-[var(--brown)]",
            )}
          >
            <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wide opacity-70">
              <SevIcon size={11} strokeWidth={2} />
              {ins.tag}
            </span>
            <p className="mt-1">{ins.text}</p>
          </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

function TeamMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  const statusLabel = {
    available: "Disponível",
    busy: "Em atendimento",
    break: "Intervalo",
    absent: "Ausente",
    vacation: "Férias",
  };
  return (
    <WidgetShell title="Equipe ao vivo" icon={widgetIcons.team_live} delay={delay}>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.teamLive.map((p) => (
          <motion.article
            key={p.id}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-white/45 bg-white/45 p-3"
          >
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="font-medium text-[var(--chocolate)]">{p.name}</p>
                <p className="truncate text-[10px] text-[var(--muted)]">{p.role}</p>
                <p className="mt-1 text-[10px] text-[var(--gold-dim)]">
                  {statusLabel[p.status]}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-[var(--muted)]">
              <span>Meta {p.goalPct}%</span>
              <span>{formatPrice(p.revenueToday)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold-bright)]"
                initial={{ width: 0 }}
                animate={{ width: `${p.goalPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.article>
        ))}
      </div>
    </WidgetShell>
  );
}

function OccupancyWidget({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  return (
    <WidgetShell title="Ocupação" icon={widgetIcons.occupancy} delay={delay}>
      <div className="flex items-end gap-3">
        <AnimatedNumber
          value={data.meta.occupancy}
          format="percent"
          className="display text-5xl text-[var(--gold-dim)]"
        />
        <p className="pb-2 text-xs text-[var(--muted)]">do dia</p>
      </div>
      <p className="mt-4 text-sm text-[var(--brown)]">
        Top: {data.meta.topPro} · {data.meta.topSvc}
      </p>
    </WidgetShell>
  );
}

function FinanceMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  const chartData = (data.financeSeries || []).map((m) => ({
    monthLabel: m.month,
    revenue: m.revenue,
    appointments: m.appointments,
  }));

  return (
    <WidgetShell title="Financeiro" icon={widgetIcons.finance_charts} delay={delay}>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Dia", data.finance.day, Wallet],
          ["Mês", data.finance.month, TrendingUp],
          ["A receber", data.finance.receivable, CreditCard],
        ].map(([l, v, Icon]) => {
          const I = Icon as LucideIcon;
          return (
          <div key={String(l)} className="rounded-xl bg-white/50 p-2">
            <p className="inline-flex items-center justify-center gap-1 text-[9px] uppercase text-[var(--muted)]">
              <I size={11} strokeWidth={1.8} className="text-[var(--gold-dim)]" />
              {l as string}
            </p>
            <p className="mt-1 text-xs font-medium">{formatPrice(Number(v))}</p>
          </div>
          );
        })}
      </div>
      <MonthlyRevenueChart data={chartData} height={160} />
    </WidgetShell>
  );
}

function ClientsMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  return (
    <WidgetShell title="Clientes" icon={widgetIcons.clients_pulse} delay={delay}>
      <ul className="max-h-72 space-y-2 overflow-x-hidden overflow-y-auto">
        {data.clients.map((c) => {
          const TagIcon = segmentIcons[c.tag] ?? UserRound;
          return (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(184,149,106,0.14)] text-[var(--gold-dim)]">
                <TagIcon size={14} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[var(--chocolate)]">{c.name}</p>
                <p className="truncate text-[10px] text-[var(--muted)]">{c.favorite}</p>
              </div>
            </div>
            <span className="rounded-full bg-[rgba(184,149,106,0.15)] px-2 py-0.5 text-[9px] uppercase text-[var(--gold-dim)]">
              {c.tag}
            </span>
          </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

function procedureCategory(name: string): ServiceCategory {
  return services.find((s) => s.name === name)?.category ?? "facial";
}

function ProceduresMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  const ranked = data.proceduresRank.slice(0, 4);
  const chartData = ranked.map((p) => {
    const cat = procedureCategory(p.name);
    const palette = categoryColors[cat];
    return {
      ...p,
      category: cat,
      short: p.name.split(" ").slice(0, 2).join(" "),
      fill: palette.solid,
      soft: palette.bg,
      text: palette.text,
    };
  });

  return (
    <WidgetShell title="Procedimentos" icon={widgetIcons.procedures_rank} delay={delay}>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="18%">
            <XAxis dataKey="short" hide />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(44,31,26,0.04)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(184,149,106,0.35)",
                background: "rgba(250,246,240,0.96)",
                color: "#2c1f1a",
                fontSize: 12,
              }}
              formatter={(value) => [String(value), "Atendimentos"]}
              labelFormatter={(label) => String(label)}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-3">
        {chartData.map((p) => {
          const Icon = categoryIcons[p.category];
          return (
          <li
            key={p.name}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/50 px-4 py-3.5"
            style={{ background: p.soft }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.55)", color: p.fill }}
              >
                <Icon size={16} strokeWidth={1.7} />
              </span>
              <span
                className="truncate text-sm font-medium"
                style={{ color: p.text }}
              >
                {p.name}
              </span>
            </div>
            <span
              className="display shrink-0 text-lg tabular-nums"
              style={{ color: p.fill }}
            >
              {p.count}
            </span>
          </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

const channelIcons: Record<string, LucideIcon> = {
  Instagram: Camera,
  WhatsApp: MessageCircle,
  Indicação: UserPlus,
  Google: Globe,
};

function CommercialMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  const c = data.commercial;
  return (
    <WidgetShell title="CRM / Comercial" icon={widgetIcons.commercial} delay={delay}>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Leads", c.leads, UserPlus],
          ["Conversão", `${c.conversion}%`, Target],
          ["No-show", c.noShow, AlertTriangle],
          ["Recuperados", c.recovered, RefreshCw],
        ].map(([l, v, Icon]) => {
          const I = Icon as LucideIcon;
          return (
          <div key={String(l)} className="rounded-xl bg-white/50 px-3 py-4">
            <p className="inline-flex items-center gap-1.5 text-[9px] uppercase text-[var(--muted)]">
              <I size={12} strokeWidth={1.8} className="text-[var(--gold-dim)]" />
              {l as string}
            </p>
            <p className="display mt-1.5 text-xl">{v as string | number}</p>
          </div>
          );
        })}
      </div>
      <ul className="mt-5 space-y-3">
        {c.channels.map((ch) => {
          const Icon = channelIcons[ch.name] ?? Globe;
          return (
            <li
              key={ch.name}
              className="rounded-2xl border border-white/50 bg-white/55 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,149,106,0.16)] text-[var(--gold-dim)]">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span className="truncate text-sm font-medium tracking-wide text-[var(--chocolate)]">
                    {ch.name}
                  </span>
                </div>
                <span className="display text-lg text-[var(--gold-dim)]">
                  {ch.value}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--gold-bright)] to-[var(--gold-dim)]"
                  style={{ width: `${ch.value}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

function NotifMini({
  data,
  delay,
}: {
  data: ControlCenterPayload;
  delay: number;
}) {
  return (
    <WidgetShell title="Notificações" icon={widgetIcons.notifications} delay={delay}>
      <ul className="max-h-72 space-y-2 overflow-x-hidden overflow-y-auto">
        {data.notifications.map((n) => {
          const NIcon =
            n.type === "payment"
              ? Wallet
              : n.type === "birthday"
                ? Gift
                : CalendarCheck;
          return (
          <li key={n.id} className="rounded-xl border border-white/40 bg-white/40 px-3 py-2">
            <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[var(--gold-dim)]">
              <NIcon size={12} strokeWidth={1.8} />
              {n.title}
            </p>
            <p className="mt-1 text-sm text-[var(--chocolate)]">{n.message}</p>
          </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

function TeamBoard({ data }: { data: ControlCenterPayload }) {
  const statusLabel = {
    available: "Disponível",
    busy: "Em atendimento",
    break: "Intervalo",
    absent: "Ausente",
    vacation: "Férias",
  };
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.teamLive.map((p, i) => (
        <motion.article
          key={p.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -4 }}
          className="cc-card p-5"
        >
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-white/60"
            />
            <div className="min-w-0 flex-1">
              <h3 className="script text-3xl text-[var(--gold)]">{p.name}</h3>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                {p.role}
              </p>
              <p className="mt-2 text-sm text-[var(--gold-dim)]">
                {statusLabel[p.status]}
              </p>
              {p.nextClient && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Próximo: {p.nextClient}
                  {p.nextAt ? ` · ${format(parseISO(p.nextAt), "HH:mm")}` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white/45 p-2">
              <p className="inline-flex items-center justify-center gap-1 text-[var(--muted)]">
                <CalendarCheck size={11} /> Atend.
              </p>
              <p className="display text-lg">{p.doneToday}</p>
            </div>
            <div className="rounded-lg bg-white/45 p-2">
              <p className="inline-flex items-center justify-center gap-1 text-[var(--muted)]">
                <Wallet size={11} /> Receita
              </p>
              <p className="display text-sm">{formatPrice(p.revenueToday)}</p>
            </div>
            <div className="rounded-lg bg-white/45 p-2">
              <p className="inline-flex items-center justify-center gap-1 text-[var(--muted)]">
                <Banknote size={11} /> Comissão
              </p>
              <p className="display text-sm">{formatPrice(p.commission)}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
              <span>Meta {p.goalPct}%</span>
              <span>Ocupação {p.occupancy}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold-bright)]"
                initial={{ width: 0 }}
                animate={{ width: `${p.goalPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {p.specialties.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-white/50 px-2 py-0.5 text-[9px] uppercase text-[var(--muted)]"
              >
                <Sparkles size={9} strokeWidth={2} />
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-[10px] text-[var(--muted)]">
            <Clock size={11} /> {p.hoursWorked}h · média {p.avgMin}min ·
            <Star size={11} className="text-[var(--gold-dim)]" fill="currentColor" />
            {p.rating.toFixed(1)}
          </p>
        </motion.article>
      ))}
    </div>
  );
}

function FinanceBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receita do dia", value: data.finance.day },
          { label: "Receita da semana", value: data.finance.week },
          { label: "Receita do mês", value: data.finance.month },
          { label: "Receita anual", value: data.finance.year },
          { label: "Contas a receber", value: data.finance.receivable },
          { label: "Contas a pagar", value: data.finance.payable },
          { label: "Ticket médio", value: data.finance.ticket },
          { label: "Comissões (est.)", value: Math.round(data.finance.day * 0.35) },
        ].map((k, i) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            format="currency"
            hint={k.label}
            icon={financeKpiIcons[k.label]}
            delay={i * 0.03}
          />
        ))}
      </div>
      <div className="md:col-span-2">
        <FinanceMini data={data} delay={0.1} />
      </div>
      <WidgetShell title="Por profissional" icon={Users} delay={0.15}>
        <ul className="space-y-2">
          {data.finance.byPro.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-2 truncate">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(184,149,106,0.14)] text-[var(--gold-dim)]">
                  <UserRound size={13} />
                </span>
                {p.name}
              </span>
              <span className="text-[var(--gold-dim)]">{formatPrice(p.revenue)}</span>
            </li>
          ))}
        </ul>
      </WidgetShell>
    </div>
  );
}

function ClientsBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <ClientsMini data={data} delay={0} />
      </div>
      <WidgetShell title="Segmentos" icon={PieChart} delay={0.08}>
        {["novo", "frequente", "vip", "inativo", "aniversario"].map((tag) => {
          const Icon = segmentIcons[tag] ?? UserRound;
          return (
          <p key={tag} className="mb-2 flex items-center justify-between gap-2 text-sm capitalize">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(184,149,106,0.14)] text-[var(--gold-dim)]">
                <Icon size={13} />
              </span>
              {tag}
            </span>
            <span>{data.clients.filter((c) => c.tag === tag).length}</span>
          </p>
          );
        })}
      </WidgetShell>
    </div>
  );
}

function ProceduresBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProceduresMini data={data} delay={0} />
      <WidgetShell title="Categorias" icon={LayoutGrid} delay={0.08}>
        <ul className="overflow-hidden rounded-2xl border border-white/45 bg-white/40">
          {data.categoriesRank.map((c, i) => {
            const palette = categoryColors[c.id as ServiceCategory];
            const Icon = categoryIcons[c.id as ServiceCategory];
            const max = Math.max(...data.categoriesRank.map((x) => x.count), 1);
            return (
              <li key={c.id}>
                {i > 0 && (
                  <hr className="m-0 border-0 border-t border-[rgba(44,31,26,0.08)]" />
                )}
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: palette?.bg ?? "rgba(184,149,106,0.16)",
                        color: palette?.solid ?? "var(--gold-dim)",
                      }}
                    >
                      {Icon ? <Icon size={18} strokeWidth={1.7} /> : null}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: palette?.text ?? "var(--chocolate)" }}
                      >
                        {c.label}
                      </p>
                      <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-black/5 sm:w-36">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(c.count / max) * 100}%`,
                            background: palette?.solid ?? "var(--gold)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    className="display shrink-0 text-2xl tabular-nums"
                    style={{ color: palette?.solid ?? "var(--gold-dim)" }}
                  >
                    {c.count}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetShell>
    </div>
  );
}

function CommercialBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return <CommercialMini data={data} delay={0} />;
}

function NotificationsBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return <NotifMini data={data} delay={0} />;
}

function InsightsBoard({
  data,
}: {
  data: ControlCenterPayload;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.insights.map((ins, i) => {
        const SevIcon =
          ins.severity === "critical" || ins.severity === "warn"
            ? AlertTriangle
            : ins.severity === "success"
              ? CheckCircle2
              : Brain;
        return (
        <motion.article
          key={ins.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="cc-card p-4"
        >
          <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[var(--gold-dim)]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(184,149,106,0.16)]">
              <SevIcon size={13} strokeWidth={1.8} />
            </span>
            {ins.tag} · {ins.severity}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--chocolate)]">
            {ins.text}
          </p>
        </motion.article>
        );
      })}
    </div>
  );
}

function SettingsBoard({
  widgets,
  onToggle,
  onPin,
  onReset,
}: {
  widgets: ReturnType<typeof useControlCenter.getState>["widgets"];
  onToggle: (id: WidgetId) => void;
  onPin: (id: WidgetId) => void;
  onReset: () => void;
}) {
  return (
    <WidgetShell title="Personalização do dashboard" icon={Settings2}>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Layout salvo automaticamente neste navegador. Arraste widgets no modo
        Personalizar da visão Dashboard.
      </p>
      <ul className="space-y-2">
        {widgets.map((w) => {
          const Icon = widgetIcons[w.id];
          return (
          <li
            key={w.id}
            className="flex items-center justify-between rounded-xl bg-white/45 px-3 py-2"
          >
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(184,149,106,0.14)] text-[var(--gold-dim)]">
                <Icon size={13} />
              </span>
              {w.label}
            </span>
            <div className="flex gap-2">
              <button type="button" className="cc-mini" onClick={() => onPin(w.id)}>
                <Pin size={11} /> {w.pinned ? "Desafixar" : "Fixar"}
              </button>
              <button type="button" className="cc-mini" onClick={() => onToggle(w.id)}>
                {w.visible ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </li>
          );
        })}
      </ul>
      <button type="button" className="btn-ghost mt-4" onClick={onReset}>
        Restaurar layout padrão
      </button>
    </WidgetShell>
  );
}

