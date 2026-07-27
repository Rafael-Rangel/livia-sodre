export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  startsAt: string;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
};
