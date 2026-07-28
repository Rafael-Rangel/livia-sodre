"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ControlCenterPayload } from "@/lib/control-center/metrics";
import {
  CONTROL_TABS,
  DEFAULT_WIDGETS,
  type ControlTab,
  type WidgetConfig,
  type WidgetId,
} from "@/lib/control-center/types";

type ThemeMode = "light" | "dark";

type ControlState = {
  tab: ControlTab;
  theme: ThemeMode;
  widgets: WidgetConfig[];
  editLayout: boolean;
  data: ControlCenterPayload | null;
  loading: boolean;
  setTab: (t: ControlTab) => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setEditLayout: (v: boolean) => void;
  reorderWidgets: (ids: WidgetId[]) => void;
  toggleWidget: (id: WidgetId) => void;
  togglePin: (id: WidgetId) => void;
  setSpan: (id: WidgetId, span: 1 | 2 | 3) => void;
  resetLayout: () => void;
  load: () => Promise<void>;
};

export const useControlCenter = create<ControlState>()(
  persist(
    (set, get) => ({
      tab: "overview",
      theme: "light",
      widgets: DEFAULT_WIDGETS,
      editLayout: false,
      data: null,
      loading: false,
      setTab: (tab) => set({ tab }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "light" ? "dark" : "light" }),
      setEditLayout: (editLayout) => set({ editLayout }),
      reorderWidgets: (ids) => {
        const map = Object.fromEntries(get().widgets.map((w) => [w.id, w]));
        const ordered = ids.map((id) => map[id]).filter(Boolean);
        const missing = get().widgets.filter((w) => !ids.includes(w.id));
        set({ widgets: [...ordered, ...missing] });
      },
      toggleWidget: (id) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w,
          ),
        }),
      togglePin: (id) =>
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, pinned: !w.pinned } : w,
          ),
        }),
      setSpan: (id, span) =>
        set({
          widgets: get().widgets.map((w) => (w.id === id ? { ...w, span } : w)),
        }),
      resetLayout: () => set({ widgets: DEFAULT_WIDGETS, editLayout: false }),
      load: async () => {
        set({ loading: true });
        try {
          const res = await fetch("/api/control-center");
          if (!res.ok) throw new Error("fail");
          const data = await res.json();
          set({ data });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "ls-control-center-v1",
      partialize: (s) => ({
        theme: s.theme,
        widgets: s.widgets,
        tab: s.tab,
      }),
    },
  ),
);

export { CONTROL_TABS };
