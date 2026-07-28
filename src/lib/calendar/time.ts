import {
  addDays,
  addMinutes,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { businessHours } from "@/lib/calendar/config";

export const TZ = businessHours.timezone;

export function nowInClinic() {
  return toZonedTime(new Date(), TZ);
}

export function toClinicDate(iso: string | Date) {
  return toZonedTime(typeof iso === "string" ? parseISO(iso) : iso, TZ);
}

export function fromClinicLocal(date: Date) {
  return fromZonedTime(date, TZ);
}

export function snapMinutes(date: Date, step = businessHours.slotMinutes) {
  const m = date.getMinutes();
  const snapped = Math.round(m / step) * step;
  const d = setMinutes(setHours(date, date.getHours()), snapped % 60);
  if (snapped >= 60) d.setHours(d.getHours() + Math.floor(snapped / 60));
  return d;
}

export function endsAtFrom(startsAt: string, durationMin: number) {
  return addMinutes(parseISO(startsAt), durationMin).toISOString();
}

export function formatTimeRange(startsAt: string, durationMin: number) {
  const start = toClinicDate(startsAt);
  const end = addMinutes(start, durationMin);
  return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
}

export function formatDayLabel(date: Date) {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGrid(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 });
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export function dayHours() {
  const { openHour, closeHour, slotMinutes } = businessHours;
  const slots: Date[] = [];
  const base = startOfDay(nowInClinic());
  let cur = setMinutes(setHours(base, openHour), 0);
  const end = setMinutes(setHours(base, closeHour), 0);
  while (cur < end) {
    slots.push(cur);
    cur = addMinutes(cur, slotMinutes);
  }
  return slots;
}

/**
 * Minutos desde openHour no grid.
 * - string ISO → converte para fuso da clínica
 * - Date → assume relógio local da clínica (ex.: nowInClinic())
 */
export function minutesFromOpen(date: Date | string) {
  const local = typeof date === "string" ? toClinicDate(date) : date;
  const open = setMinutes(
    setHours(startOfDay(local), businessHours.openHour),
    businessHours.openMinute,
  );
  return differenceInMinutes(local, open);
}

export function totalDayMinutes() {
  return (
    businessHours.closeHour * 60 +
    businessHours.closeMinute -
    (businessHours.openHour * 60 + businessHours.openMinute)
  );
}

/** Posição Y/altura no grid, clipada ao horário comercial */
export function eventGeometry(
  startsAt: string,
  durationMin: number,
  zoom: number,
) {
  const startMin = minutesFromOpen(startsAt);
  const endMin = startMin + Math.max(5, durationMin);
  const dayTotal = totalDayMinutes();
  const visibleStart = Math.min(dayTotal, Math.max(0, startMin));
  const visibleEnd = Math.min(dayTotal, Math.max(visibleStart + 5, endMin));
  // 1px de folga evita cards sequenciais “entrarem” um no outro
  const rawHeight = ((visibleEnd - visibleStart) / 60) * zoom;
  const top = (visibleStart / 60) * zoom;
  const height = Math.max(22, rawHeight - 1);
  return { top, height, hidden: visibleEnd <= 0 || visibleStart >= dayTotal };
}

export function isToday(date: Date) {
  return isSameDay(date, nowInClinic());
}

export function rangeForPreset(
  preset: string,
): { from?: Date; to?: Date } | null {
  const now = nowInClinic();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "tomorrow": {
      const t = addDays(now, 1);
      return { from: startOfDay(t), to: endOfDay(t) };
    }
    case "week":
      return {
        from: startOfWeek(now, { weekStartsOn: 0 }),
        to: endOfWeek(now, { weekStartsOn: 0 }),
      };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "future":
      return { from: now };
    case "past":
      return { to: now };
    default:
      return null;
  }
}

export function inDateRange(
  iso: string,
  from?: Date,
  to?: Date,
) {
  const d = parseISO(iso);
  if (from && to) return isWithinInterval(d, { start: from, end: to });
  if (from) return d >= from;
  if (to) return d <= to;
  return true;
}

export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const n = digits.startsWith("55") ? digits : `55${digits}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${n}${q}`;
}
