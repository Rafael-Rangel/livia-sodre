"use client";

import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import { categoryColors, normalizeStatus, statusMeta } from "@/lib/calendar/config";
import { formatTimeRange } from "@/lib/calendar/time";

type Props = {
  apt: Appointment;
  compact?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  dragging?: boolean;
  showResize?: boolean;
  onResizeStart?: (e: React.PointerEvent) => void;
};

export function EventCard({
  apt,
  compact,
  style,
  className,
  onClick,
  onContextMenu,
  onPointerDown,
  dragging,
  showResize,
  onResizeStart,
}: Props) {
  const colors = categoryColors[apt.category] || categoryColors.facial;
  const status = normalizeStatus(apt.status);
  const muted = status === "cancelled" || status === "no_show";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      style={{
        ...style,
        background: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        color: colors.text,
        opacity: muted ? 0.55 : 1,
      }}
      className={cn(
        "cal-event group absolute left-1 right-1 z-10 overflow-hidden rounded-md px-1.5 py-1 text-left shadow-sm transition",
        "hover:z-20 hover:shadow-md hover:brightness-[1.03]",
        dragging && "z-30 cursor-grabbing opacity-90 shadow-lg",
        className,
      )}
    >
      <p className="truncate text-[11px] font-semibold leading-tight">
        {apt.clientName}
      </p>
      {!compact && (
        <>
          <p className="truncate text-[10px] opacity-80">{apt.serviceName}</p>
          <p className="mt-0.5 truncate text-[9px] opacity-70">
            {formatTimeRange(apt.startsAt, apt.durationMin)} · {apt.professionalName}
          </p>
        </>
      )}
      {compact && (
        <p className="truncate text-[9px] opacity-75">
          {formatTimeRange(apt.startsAt, apt.durationMin)}
        </p>
      )}
      <span
        className="mt-1 inline-block rounded px-1 text-[8px] uppercase tracking-wide"
        style={{ background: statusMeta[status].bg, color: statusMeta[status].color }}
      >
        {statusMeta[status].label}
      </span>
      {showResize && (
        <div
          data-resize
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart?.(e);
          }}
        />
      )}
    </div>
  );
}
