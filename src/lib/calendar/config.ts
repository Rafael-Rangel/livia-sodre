import type { ServiceCategory } from "@/data/services";
import type { CalendarStatus, BusinessHours, Room } from "@/lib/types";

export const categoryColors: Record<
  ServiceCategory,
  { bg: string; border: string; text: string; solid: string; label: string }
> = {
  facial: {
    bg: "rgba(59, 130, 246, 0.18)",
    border: "#3b82f6",
    text: "#1e3a8a",
    solid: "#3b82f6",
    label: "Estética Facial",
  },
  micropigmentacao: {
    bg: "rgba(139, 92, 246, 0.18)",
    border: "#8b5cf6",
    text: "#4c1d95",
    solid: "#8b5cf6",
    label: "Micropigmentação",
  },
  cilios: {
    bg: "rgba(236, 72, 153, 0.18)",
    border: "#ec4899",
    text: "#9d174d",
    solid: "#ec4899",
    label: "Cílios & Sobrancelhas",
  },
  corporal: {
    bg: "rgba(34, 197, 94, 0.18)",
    border: "#22c55e",
    text: "#14532d",
    solid: "#22c55e",
    label: "Estética Corporal",
  },
  unhas: {
    bg: "rgba(249, 115, 22, 0.18)",
    border: "#f97316",
    text: "#9a3412",
    solid: "#f97316",
    label: "Unhas & Nail Design",
  },
  depilacao: {
    bg: "rgba(239, 68, 68, 0.18)",
    border: "#ef4444",
    text: "#7f1d1d",
    solid: "#ef4444",
    label: "Depilação",
  },
};

export const statusMeta: Record<
  CalendarStatus,
  { label: string; color: string; bg: string }
> = {
  scheduled: { label: "Agendado", color: "#b8956a", bg: "rgba(184,149,106,0.18)" },
  confirmed: { label: "Confirmado", color: "#3f6b48", bg: "rgba(90,140,100,0.16)" },
  in_progress: { label: "Em atendimento", color: "#1d4ed8", bg: "rgba(59,130,246,0.16)" },
  finished: { label: "Finalizado", color: "#374151", bg: "rgba(55,65,81,0.12)" },
  cancelled: { label: "Cancelado", color: "#8a3030", bg: "rgba(160,60,60,0.12)" },
  no_show: { label: "Não compareceu", color: "#92400e", bg: "rgba(245,158,11,0.16)" },
  rescheduled: { label: "Reagendado", color: "#6d28d9", bg: "rgba(139,92,246,0.16)" },
};

export const rooms: Room[] = [
  { id: "sala-01", name: "Sala 01", color: "#b8956a" },
  { id: "sala-02", name: "Sala 02", color: "#8b5cf6" },
  { id: "sala-botox", name: "Sala Botox", color: "#3b82f6" },
  { id: "sala-laser", name: "Sala Laser", color: "#ec4899" },
  { id: "sala-corporal", name: "Sala Corporal", color: "#22c55e" },
];

export const professionalColors: Record<string, string> = {
  livia: "#b8956a",
  yame: "#22c55e",
  ariany: "#f97316",
  luana: "#ec4899",
};

export const businessHours: BusinessHours = {
  timezone: "America/Sao_Paulo",
  daysOpen: [1, 2, 3, 4, 5, 6],
  openHour: 8,
  openMinute: 0,
  closeHour: 20,
  closeMinute: 0,
  lunchStart: "12:00",
  lunchEnd: "13:00",
  slotMinutes: 5,
};

export const blockTypeLabels: Record<string, string> = {
  lunch: "Almoço",
  course: "Curso",
  meeting: "Reunião",
  vacation: "Férias",
  day_off: "Folga",
  maintenance: "Manutenção",
  custom: "Bloqueio",
};

/** Normaliza status legado → calendar */
export function normalizeStatus(status: string): CalendarStatus {
  if (status === "pending") return "scheduled";
  if (status === "completed") return "finished";
  if (status in statusMeta) return status as CalendarStatus;
  return "scheduled";
}
