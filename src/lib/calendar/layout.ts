import { parseISO } from "date-fns";
import type { Appointment } from "@/lib/types";

export type LaidOutAppointment = {
  apt: Appointment;
  /** 0-based column inside the overlap cluster */
  column: number;
  /** total columns in the overlap cluster */
  columns: number;
};

/**
 * Google Calendar–style layout: overlapping events sit side-by-side
 * instead of stacking on top of each other.
 */
export function layoutOverlappingEvents(
  items: Appointment[],
): LaidOutAppointment[] {
  if (!items.length) return [];

  const events = items
    .map((apt) => {
      const start = parseISO(apt.startsAt).getTime();
      return {
        apt,
        start,
        end: start + Math.max(5, apt.durationMin) * 60_000,
      };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  type Placed = (typeof events)[number] & { column: number; index: number };
  const placed: Placed[] = [];
  const active: Placed[] = [];

  events.forEach((ev, index) => {
    for (let i = active.length - 1; i >= 0; i -= 1) {
      if (active[i].end <= ev.start) active.splice(i, 1);
    }
    const used = new Set(active.map((a) => a.column));
    let column = 0;
    while (used.has(column)) column += 1;
    const row: Placed = { ...ev, column, index };
    placed.push(row);
    active.push(row);
  });

  // Union overlapping events into clusters to know total column count
  const parent = placed.map((_, i) => i);
  const find = (i: number): number =>
    parent[i] === i ? i : (parent[i] = find(parent[i]));
  const unite = (i: number, j: number) => {
    const a = find(i);
    const b = find(j);
    if (a !== b) parent[a] = b;
  };

  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      if (placed[i].start < placed[j].end && placed[j].start < placed[i].end) {
        unite(i, j);
      }
    }
  }

  const clusterCols = new Map<number, number>();
  placed.forEach((p, i) => {
    const root = find(i);
    clusterCols.set(root, Math.max(clusterCols.get(root) || 0, p.column + 1));
  });

  return placed.map((p, i) => ({
    apt: p.apt,
    column: p.column,
    columns: Math.max(1, clusterCols.get(find(i)) || 1),
  }));
}

/** CSS left/width so cards share the column without covering each other */
export function overlapStyle(column: number, columns: number) {
  const gap = 3;
  const widthPct = 100 / columns;
  const leftPct = column * widthPct;
  return {
    left: `calc(${leftPct}% + ${gap}px)`,
    width: `calc(${widthPct}% - ${gap * 2}px)`,
    right: "auto" as const,
  };
}
