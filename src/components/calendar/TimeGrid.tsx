"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  isToday,
  minutesFromOpen,
  nowInClinic,
  totalDayMinutes,
} from "@/lib/calendar/time";
import { businessHours } from "@/lib/calendar/config";

export function CurrentTimeLine({
  day,
  zoom,
}: {
  day: Date;
  zoom: number;
}) {
  const [now, setNow] = useState(nowInClinic);

  useEffect(() => {
    const t = setInterval(() => setNow(nowInClinic()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!isToday(day)) return null;

  const mins = minutesFromOpen(now);
  if (mins < 0 || mins > totalDayMinutes()) return null;

  const top = (mins / 60) * zoom;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top }}
    >
      <div className="relative flex items-center">
        <span className="absolute -left-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-red-500 shadow" />
        <div className="h-px w-full bg-red-500" />
        <span className="absolute right-1 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-medium text-white">
          {format(now, "HH:mm")}
        </span>
      </div>
    </div>
  );
}

export function HourGrid({ zoom }: { zoom: number }) {
  const hours =
    businessHours.closeHour - businessHours.openHour;
  return (
    <div className="absolute inset-0">
      {Array.from({ length: hours }, (_, i) => {
        const hour = businessHours.openHour + i;
        return (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-[rgba(44,31,26,0.06)]"
            style={{ top: i * zoom, height: zoom }}
          >
            <div
              className="absolute left-0 right-0 border-t border-dashed border-[rgba(44,31,26,0.04)]"
              style={{ top: zoom / 2 }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function HourLabels({ zoom }: { zoom: number }) {
  const hours = businessHours.closeHour - businessHours.openHour;
  return (
    <div className="relative w-14 shrink-0 select-none">
      {Array.from({ length: hours + 1 }, (_, i) => {
        const hour = businessHours.openHour + i;
        return (
          <div
            key={hour}
            className="absolute right-2 -translate-y-1/2 text-[10px] text-[var(--muted)]"
            style={{ top: i * zoom }}
          >
            {String(hour).padStart(2, "0")}:00
          </div>
        );
      })}
    </div>
  );
}
