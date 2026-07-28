import type { LucideIcon } from "@/lib/icons";

export type ControlTab =
  | "overview"
  | "agenda"
  | "team"
  | "finance"
  | "clients"
  | "procedures"
  | "commercial"
  | "notifications"
  | "insights"
  | "settings";

export type WidgetId =
  | "kpis"
  | "agenda_today"
  | "team_live"
  | "finance_charts"
  | "clients_pulse"
  | "procedures_rank"
  | "commercial"
  | "notifications"
  | "insights"
  | "occupancy";

export type WidgetConfig = {
  id: WidgetId;
  label: string;
  visible: boolean;
  pinned: boolean;
  span: 1 | 2 | 3;
};

export type KpiItem = {
  id: string;
  label: string;
  value: number;
  format: "number" | "currency" | "percent" | "minutes";
  delta?: number;
  hint: string;
  tone?: "default" | "success" | "warn" | "danger" | "info";
};

export type AiInsight = {
  id: string;
  text: string;
  severity: "info" | "success" | "warn" | "critical";
  tag: string;
};

export type TeamLiveStatus =
  | "available"
  | "busy"
  | "break"
  | "absent"
  | "vacation";

export type TeamLiveCard = {
  id: string;
  name: string;
  role: string;
  image: string;
  specialties: string[];
  status: TeamLiveStatus;
  nextClient?: string;
  nextAt?: string;
  doneToday: number;
  revenueToday: number;
  commission: number;
  goalPct: number;
  occupancy: number;
  rating: number;
  hoursWorked: number;
  avgMin: number;
};

export type ClientPulse = {
  id: string;
  name: string;
  phone: string;
  tag: "novo" | "frequente" | "vip" | "inativo" | "aniversario";
  lastVisit: string;
  ltv: number;
  favorite: string;
};

export type ControlTabDef = {
  id: ControlTab;
  label: string;
  href?: string;
};

export const CONTROL_TABS: ControlTabDef[] = [
  { id: "overview", label: "Dashboard" },
  { id: "agenda", label: "Agenda", href: "/dashboard/agenda" },
  { id: "team", label: "Equipe" },
  { id: "clients", label: "Clientes" },
  { id: "procedures", label: "Procedimentos" },
  { id: "finance", label: "Financeiro" },
  { id: "commercial", label: "CRM" },
  { id: "notifications", label: "Alertas" },
  { id: "insights", label: "Insights IA" },
  { id: "settings", label: "Config" },
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "kpis", label: "KPIs", visible: true, pinned: true, span: 3 },
  { id: "agenda_today", label: "Agenda do dia", visible: true, pinned: true, span: 2 },
  { id: "insights", label: "Insights IA", visible: true, pinned: false, span: 1 },
  { id: "team_live", label: "Equipe ao vivo", visible: true, pinned: false, span: 2 },
  { id: "occupancy", label: "Ocupação", visible: true, pinned: false, span: 1 },
  { id: "finance_charts", label: "Financeiro", visible: true, pinned: false, span: 2 },
  { id: "clients_pulse", label: "Clientes", visible: true, pinned: false, span: 1 },
  { id: "procedures_rank", label: "Procedimentos", visible: true, pinned: false, span: 1 },
  { id: "commercial", label: "Comercial", visible: true, pinned: false, span: 1 },
  { id: "notifications", label: "Notificações", visible: true, pinned: false, span: 1 },
];

export type IconMap = Record<string, LucideIcon>;
