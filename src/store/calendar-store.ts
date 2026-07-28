"use client";

import { create } from "zustand";
import type {
  Appointment,
  CalendarBlock,
  CalendarFilters,
  CalendarNotification,
  CalendarView,
} from "@/lib/types";
import { nowInClinic } from "@/lib/calendar/time";

type Metrics = {
  todayCount: number;
  expectedRevenue: number;
  realizedRevenue: number;
  confirmed: number;
  pending: number;
  inProgress: number;
  freeHint: number;
  occupancy: number;
  avgDuration: number;
  topPro: string;
  topSvc: string;
};

type CalendarState = {
  view: CalendarView;
  cursor: Date;
  zoom: number; // px per hour
  appointments: Appointment[];
  blocks: CalendarBlock[];
  notifications: CalendarNotification[];
  metrics: Metrics | null;
  filters: CalendarFilters;
  selectedId: string | null;
  formOpen: boolean;
  formMode: "create" | "edit" | "reschedule";
  formDefaults: Partial<Appointment> | null;
  contextMenu: { x: number; y: number; id: string } | null;
  loading: boolean;
  setView: (v: CalendarView) => void;
  setCursor: (d: Date) => void;
  setZoom: (z: number) => void;
  setFilters: (f: Partial<CalendarFilters>) => void;
  select: (id: string | null) => void;
  openCreate: (defaults?: Partial<Appointment>) => void;
  openEdit: (apt: Appointment, mode?: "edit" | "reschedule") => void;
  closeForm: () => void;
  setContextMenu: (m: CalendarState["contextMenu"]) => void;
  load: () => Promise<void>;
  save: (data: Partial<Appointment> & { id?: string }) => Promise<Appointment | null>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  patch: (id: string, patch: Partial<Appointment>) => Promise<void>;
};

const defaultFilters: CalendarFilters = {
  query: "",
  professionalIds: [],
  roomIds: [],
  categories: [],
  statuses: [],
  paymentMethods: [],
  datePreset: "all",
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  view: "week",
  cursor: nowInClinic(),
  zoom: 72,
  appointments: [],
  blocks: [],
  notifications: [],
  metrics: null,
  filters: defaultFilters,
  selectedId: null,
  formOpen: false,
  formMode: "create",
  formDefaults: null,
  contextMenu: null,
  loading: false,

  setView: (view) => set({ view }),
  setCursor: (cursor) => set({ cursor }),
  setZoom: (zoom) => set({ zoom: Math.min(140, Math.max(48, zoom)) }),
  setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
  select: (selectedId) => set({ selectedId, contextMenu: null }),
  openCreate: (defaults) =>
    set({
      formOpen: true,
      formMode: "create",
      formDefaults: defaults || null,
    }),
  openEdit: (apt, mode = "edit") =>
    set({
      formOpen: true,
      formMode: mode,
      formDefaults: apt,
      selectedId: apt.id,
    }),
  closeForm: () => set({ formOpen: false, formDefaults: null }),
  setContextMenu: (contextMenu) => set({ contextMenu }),

  load: async () => {
    set({ loading: true });
    try {
      const [apts, blocks, metrics, notifications] = await Promise.all([
        fetch("/api/appointments").then((r) => r.json()),
        fetch("/api/appointments?summary=blocks").then((r) => r.json()),
        fetch("/api/appointments?summary=metrics").then((r) => r.json()),
        fetch("/api/appointments?summary=notifications").then((r) => r.json()),
      ]);
      set({
        appointments: Array.isArray(apts) ? apts : [],
        blocks: Array.isArray(blocks) ? blocks : [],
        metrics: metrics?.todayCount != null ? metrics : null,
        notifications: Array.isArray(notifications) ? notifications : [],
      });
    } finally {
      set({ loading: false });
    }
  },

  save: async (data) => {
    if (data.id) {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const updated = await res.json();
      set({
        appointments: get().appointments.map((a) =>
          a.id === updated.id ? updated : a,
        ),
        formOpen: false,
      });
      await get().load();
      return updated;
    }
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const created = await res.json();
    set({ formOpen: false });
    await get().load();
    return created;
  },

  remove: async (id) => {
    await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
    set({ selectedId: null, contextMenu: null });
    await get().load();
  },

  duplicate: async (id) => {
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate", id }),
    });
    set({ contextMenu: null });
    await get().load();
  },

  patch: async (id, patch) => {
    // optimistic
    set({
      appointments: get().appointments.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    });
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    await get().load();
  },
}));
