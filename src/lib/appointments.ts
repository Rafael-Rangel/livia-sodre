import { Appointment } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & {
  __lsAppointments?: Appointment[];
};

function store(): Appointment[] {
  if (!globalStore.__lsAppointments) {
    globalStore.__lsAppointments = seedAppointments();
  }
  return globalStore.__lsAppointments;
}

function seedAppointments(): Appointment[] {
  const today = new Date();
  const iso = (d: Date, h: number, m = 0) => {
    const x = new Date(d);
    x.setHours(h, m, 0, 0);
    return x.toISOString();
  };

  return [
    {
      id: "apt-001",
      clientName: "Mariana Costa",
      clientPhone: "(21) 98888-1111",
      clientEmail: "mariana@email.com",
      serviceId: "micropigmentacao-fio",
      serviceName: "Micropigmentação Fio a Fio",
      professionalId: "livia",
      professionalName: "Lívia Sodré",
      startsAt: iso(today, 10, 0),
      durationMin: 120,
      price: 450,
      status: "confirmed",
      notes: "",
      createdAt: new Date().toISOString(),
      paymentStatus: "paid",
      paymentMethod: "PIX",
    },
    {
      id: "apt-002",
      clientName: "Juliana Alves",
      clientPhone: "(21) 97777-2222",
      clientEmail: "ju@email.com",
      serviceId: "nail-design",
      serviceName: "Nail Design Completo",
      professionalId: "ariany",
      professionalName: "Ariany",
      startsAt: iso(today, 14, 0),
      durationMin: 90,
      price: 80,
      status: "confirmed",
      notes: "",
      createdAt: new Date().toISOString(),
      paymentStatus: "pending",
      paymentMethod: "Cartão",
    },
    {
      id: "apt-003",
      clientName: "Camila Rocha",
      clientPhone: "(21) 96666-3333",
      clientEmail: "camila@email.com",
      serviceId: "ventosaterapia",
      serviceName: "Ventosaterapia",
      professionalId: "yame",
      professionalName: "Yamê",
      startsAt: iso(new Date(today.getTime() + 86400000), 11, 0),
      durationMin: 50,
      price: 100,
      status: "pending",
      notes: "Primeira visita",
      createdAt: new Date().toISOString(),
      paymentStatus: "pending",
      paymentMethod: "PIX",
    },
    {
      id: "apt-004",
      clientName: "Beatriz Lima",
      clientPhone: "(21) 95555-4444",
      clientEmail: "bia@email.com",
      serviceId: "manicure",
      serviceName: "Manicure Completa",
      professionalId: "luana",
      professionalName: "Luana",
      startsAt: iso(new Date(today.getTime() - 86400000), 15, 0),
      durationMin: 50,
      price: 45,
      status: "completed",
      notes: "",
      createdAt: new Date().toISOString(),
      paymentStatus: "paid",
      paymentMethod: "Dinheiro",
    },
  ];
}

export function listAppointments() {
  return [...store()].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function createAppointment(
  data: Omit<Appointment, "id" | "createdAt" | "status"> & {
    status?: Appointment["status"];
  },
) {
  const apt: Appointment = {
    ...data,
    id: `apt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: data.status ?? "pending",
  };
  store().push(apt);
  return apt;
}

export function updateAppointment(
  id: string,
  patch: Partial<Appointment>,
): Appointment | null {
  const list = store();
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  return list[idx];
}

export function getFinancialSummary() {
  const list = store();
  const paid = list.filter((a) => a.paymentStatus === "paid");
  const pending = list.filter((a) => a.paymentStatus === "pending");
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
    confirmed: list.filter((a) => a.status === "confirmed").length,
    completed: list.filter((a) => a.status === "completed").length,
    byProfessional: Object.values(byPro),
  };
}
