import type { ServiceCategory } from "@/data/services";

/** Status da agenda clínica (Google Calendar style) */
export type CalendarStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "finished"
  | "cancelled"
  | "no_show"
  | "rescheduled";

/** Compatível com status legado do booking público */
export type AppointmentStatus =
  | CalendarStatus
  | "pending"
  | "completed";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientPhoto?: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  professionalId: string;
  professionalName: string;
  roomId: string;
  roomName: string;
  startsAt: string;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  history?: ClientHistoryItem[];
};

export type ClientHistoryItem = {
  id: string;
  date: string;
  serviceName: string;
  professionalName: string;
  status: string;
};

export type Room = {
  id: string;
  name: string;
  color: string;
};

export type CalendarBlock = {
  id: string;
  title: string;
  type: "lunch" | "course" | "meeting" | "vacation" | "day_off" | "maintenance" | "custom";
  professionalId?: string;
  roomId?: string;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
};

export type BusinessHours = {
  timezone: string;
  daysOpen: number[]; // 0=Dom .. 6=Sab
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  lunchStart: string; // "12:00"
  lunchEnd: string; // "13:00"
  slotMinutes: number;
};

export type CalendarFilters = {
  query: string;
  professionalIds: string[];
  roomIds: string[];
  categories: ServiceCategory[];
  statuses: CalendarStatus[];
  paymentMethods: string[];
  datePreset: "all" | "today" | "tomorrow" | "week" | "month" | "future" | "past" | "custom";
  customFrom?: string;
  customTo?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type CalendarNotification = {
  id: string;
  type:
    | "created"
    | "cancelled"
    | "rescheduled"
    | "confirmed"
    | "arriving"
    | "late"
    | "conflict";
  title: string;
  message: string;
  at: string;
  read: boolean;
  appointmentId?: string;
};
