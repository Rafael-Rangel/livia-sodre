import { Appointment, CalendarBlock, CalendarNotification } from "@/lib/types";
import {
  buildMockAppointments,
  buildMockBlocks,
  categoryForService,
} from "@/data/dashboard-mock";
import { rooms } from "@/lib/calendar/config";
import { normalizeStatus } from "@/lib/calendar/config";

const globalStore = globalThis as typeof globalThis & {
  __lsAppointmentsV2?: Appointment[];
  __lsBlocksV2?: CalendarBlock[];
  __lsNotificationsV2?: CalendarNotification[];
};

function store(): Appointment[] {
  if (!globalStore.__lsAppointmentsV2) {
    globalStore.__lsAppointmentsV2 = buildMockAppointments();
  }
  return globalStore.__lsAppointmentsV2;
}

function blocks(): CalendarBlock[] {
  if (!globalStore.__lsBlocksV2) {
    globalStore.__lsBlocksV2 = buildMockBlocks();
  }
  return globalStore.__lsBlocksV2;
}

function notifications(): CalendarNotification[] {
  if (!globalStore.__lsNotificationsV2) {
    globalStore.__lsNotificationsV2 = [];
  }
  return globalStore.__lsNotificationsV2;
}

function pushNotif(
  partial: Omit<CalendarNotification, "id" | "at" | "read">,
) {
  notifications().unshift({
    ...partial,
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    read: false,
  });
}

function withDefaults(
  data: Partial<Appointment> &
    Pick<
      Appointment,
      | "clientName"
      | "clientPhone"
      | "serviceId"
      | "serviceName"
      | "professionalId"
      | "professionalName"
      | "startsAt"
      | "durationMin"
      | "price"
    >,
): Appointment {
  const room =
    rooms.find((r) => r.id === data.roomId) ||
    rooms[0];
  return {
    id: data.id || `apt-${Date.now()}`,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail || "",
    clientPhoto: data.clientPhoto,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    category: data.category || categoryForService(data.serviceId),
    professionalId: data.professionalId,
    professionalName: data.professionalName,
    roomId: room.id,
    roomName: data.roomName || room.name,
    startsAt: data.startsAt,
    durationMin: data.durationMin,
    price: data.price,
    status: data.status || "scheduled",
    notes: data.notes || "",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentStatus: data.paymentStatus || "pending",
    paymentMethod: data.paymentMethod || "A definir",
    history: data.history || [],
  };
}

export function listAppointments() {
  return [...store()].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function listBlocks() {
  return [...blocks()];
}

export function listNotifications() {
  return [...notifications()];
}

export function markNotificationsRead() {
  notifications().forEach((n) => {
    n.read = true;
  });
}

export function createAppointment(
  data: Omit<Appointment, "id" | "createdAt" | "status" | "category" | "roomId" | "roomName"> & {
    status?: Appointment["status"];
    category?: Appointment["category"];
    roomId?: string;
    roomName?: string;
  },
) {
  const apt = withDefaults({
    ...data,
    status: data.status ?? "pending",
  });
  store().push(apt);
  pushNotif({
    type: "created",
    title: "Novo agendamento",
    message: `${apt.clientName} · ${apt.serviceName}`,
    appointmentId: apt.id,
  });
  return apt;
}

export function updateAppointment(
  id: string,
  patch: Partial<Appointment>,
): Appointment | null {
  const list = store();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const prev = list[idx];
  const next = {
    ...prev,
    ...patch,
    id: prev.id,
    updatedAt: new Date().toISOString(),
  };
  if (patch.roomId) {
    next.roomName =
      rooms.find((r) => r.id === patch.roomId)?.name || next.roomName;
  }
  if (patch.serviceId && !patch.category) {
    next.category = categoryForService(patch.serviceId);
  }
  list[idx] = next;

  const ns = normalizeStatus(next.status);
  if (patch.status && patch.status !== prev.status) {
    if (ns === "cancelled") {
      pushNotif({
        type: "cancelled",
        title: "Cancelamento",
        message: `${next.clientName} cancelou`,
        appointmentId: next.id,
      });
    } else if (ns === "confirmed") {
      pushNotif({
        type: "confirmed",
        title: "Confirmação",
        message: `${next.clientName} confirmou`,
        appointmentId: next.id,
      });
    } else if (ns === "rescheduled" || patch.startsAt) {
      pushNotif({
        type: "rescheduled",
        title: "Remarcação",
        message: `${next.clientName} remarcou`,
        appointmentId: next.id,
      });
    }
  } else if (patch.startsAt && patch.startsAt !== prev.startsAt) {
    pushNotif({
      type: "rescheduled",
      title: "Horário alterado",
      message: `${next.clientName} movido na agenda`,
      appointmentId: next.id,
    });
  }

  return next;
}

export function deleteAppointment(id: string): boolean {
  const list = store();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  const [removed] = list.splice(idx, 1);
  pushNotif({
    type: "cancelled",
    title: "Agendamento excluído",
    message: `${removed.clientName} · ${removed.serviceName}`,
    appointmentId: id,
  });
  return true;
}

export function duplicateAppointment(id: string): Appointment | null {
  const src = store().find((a) => a.id === id);
  if (!src) return null;
  const copy = withDefaults({
    ...src,
    id: undefined,
    status: "scheduled",
    paymentStatus: "pending",
    createdAt: undefined,
  });
  store().push(copy);
  pushNotif({
    type: "created",
    title: "Agendamento duplicado",
    message: `${copy.clientName} · ${copy.serviceName}`,
    appointmentId: copy.id,
  });
  return copy;
}

export function createBlock(block: Omit<CalendarBlock, "id">) {
  const b: CalendarBlock = { ...block, id: `blk-${Date.now()}` };
  blocks().push(b);
  return b;
}

export function getFinancialSummary() {
  const list = store();
  const paid = list.filter((a) => a.paymentStatus === "paid");
  const pending = list.filter(
    (a) =>
      a.paymentStatus === "pending" &&
      normalizeStatus(a.status) !== "cancelled",
  );
  const revenue = paid.reduce((s, a) => s + a.price, 0);
  const pendingAmount = pending.reduce((s, a) => s + a.price, 0);
  const byPro = list.reduce<
    Record<string, { name: string; count: number; revenue: number }>
  >((acc, a) => {
    if (!acc[a.professionalId]) {
      acc[a.professionalId] = {
        name: a.professionalName,
        count: 0,
        revenue: 0,
      };
    }
    acc[a.professionalId].count += 1;
    if (a.paymentStatus === "paid") {
      acc[a.professionalId].revenue += a.price;
    }
    return acc;
  }, {});

  return {
    revenue,
    pendingAmount,
    totalAppointments: list.length,
    confirmed: list.filter((a) => normalizeStatus(a.status) === "confirmed")
      .length,
    completed: list.filter((a) => normalizeStatus(a.status) === "finished")
      .length,
    cancelled: list.filter((a) => normalizeStatus(a.status) === "cancelled")
      .length,
    byProfessional: Object.values(byPro),
  };
}

export function getAgendaMetrics() {
  const list = listAppointments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayList = list.filter((a) => {
    const d = new Date(a.startsAt);
    return d >= today && d < tomorrow;
  });
  const active = todayList.filter(
    (a) => !["cancelled", "no_show"].includes(normalizeStatus(a.status)),
  );
  const confirmed = active.filter(
    (a) => normalizeStatus(a.status) === "confirmed",
  ).length;
  const pending = active.filter(
    (a) => normalizeStatus(a.status) === "scheduled",
  ).length;
  const inProgress = active.filter(
    (a) => normalizeStatus(a.status) === "in_progress",
  ).length;
  const finished = todayList.filter(
    (a) => normalizeStatus(a.status) === "finished",
  );
  const expected = active.reduce((s, a) => s + a.price, 0);
  const realized = finished.reduce((s, a) => s + a.price, 0);
  const avgDuration =
    active.length > 0
      ? Math.round(
          active.reduce((s, a) => s + a.durationMin, 0) / active.length,
        )
      : 0;

  const byPro = active.reduce<Record<string, number>>((acc, a) => {
    acc[a.professionalName] = (acc[a.professionalName] || 0) + 1;
    return acc;
  }, {});
  const topPro =
    Object.entries(byPro).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const bySvc = active.reduce<Record<string, number>>((acc, a) => {
    acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
    return acc;
  }, {});
  const topSvc =
    Object.entries(bySvc).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const occupiedSlots = active.reduce((s, a) => s + a.durationMin, 0);
  const dayCapacity = 8 * 60 * 4; // 4 pros × 8h
  const occupancy = Math.min(100, Math.round((occupiedSlots / dayCapacity) * 100));

  return {
    todayCount: active.length,
    expectedRevenue: expected,
    realizedRevenue: realized,
    confirmed,
    pending,
    inProgress,
    freeHint: Math.max(0, 32 - active.length),
    occupancy,
    avgDuration,
    topPro,
    topSvc,
  };
}
