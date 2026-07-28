import { parseISO } from "date-fns";
import type { Appointment, CalendarFilters } from "@/lib/types";
import { normalizeStatus } from "@/lib/calendar/config";
import { inDateRange, rangeForPreset } from "@/lib/calendar/time";

export function filterAppointments(
  items: Appointment[],
  filters: CalendarFilters,
): Appointment[] {
  const q = filters.query.trim().toLowerCase();
  const range = rangeForPreset(filters.datePreset);
  const from =
    filters.datePreset === "custom" && filters.customFrom
      ? parseISO(filters.customFrom)
      : range?.from;
  const to =
    filters.datePreset === "custom" && filters.customTo
      ? parseISO(filters.customTo)
      : range?.to;

  return items.filter((a) => {
    if (q) {
      const hay = [
        a.clientName,
        a.clientPhone,
        a.serviceName,
        a.professionalName,
        a.roomName,
        a.notes,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (
      filters.professionalIds.length &&
      !filters.professionalIds.includes(a.professionalId)
    ) {
      return false;
    }
    if (filters.roomIds.length && !filters.roomIds.includes(a.roomId)) {
      return false;
    }
    if (filters.categories.length && !filters.categories.includes(a.category)) {
      return false;
    }
    if (filters.statuses.length) {
      const s = normalizeStatus(a.status);
      if (!filters.statuses.includes(s)) return false;
    }
    if (
      filters.paymentMethods.length &&
      !filters.paymentMethods.includes(a.paymentMethod)
    ) {
      return false;
    }
    if (filters.minPrice != null && a.price < filters.minPrice) return false;
    if (filters.maxPrice != null && a.price > filters.maxPrice) return false;
    if (!inDateRange(a.startsAt, from, to)) return false;
    return true;
  });
}
