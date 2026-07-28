import { Appointment, CalendarBlock } from "@/lib/types";
import { services, type ServiceCategory } from "@/data/services";
import { rooms } from "@/lib/calendar/config";
import { normalizeStatus } from "@/lib/calendar/config";
import { fromClinicLocal, nowInClinic } from "@/lib/calendar/time";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";

const clients = [
  ["Mariana Costa", "(21) 98888-1111", "mariana@email.com"],
  ["Juliana Alves", "(21) 97777-2222", "ju@email.com"],
  ["Camila Rocha", "(21) 96666-3333", "camila@email.com"],
  ["Beatriz Lima", "(21) 95555-4444", "bia@email.com"],
  ["Fernanda Melo", "(21) 99444-5555", "fe@email.com"],
  ["Patricia Souza", "(21) 98333-6666", "pati@email.com"],
  ["Amanda Ribeiro", "(21) 97222-7777", "amanda@email.com"],
  ["Larissa Torres", "(21) 96111-8888", "lari@email.com"],
  ["Gabriela Nunes", "(21) 95999-1212", "gabi@email.com"],
  ["Renata Dias", "(21) 94888-3434", "renata@email.com"],
  ["Sofia Martins", "(21) 93777-5656", "sofia@email.com"],
  ["Helena Prado", "(21) 92666-7878", "helena@email.com"],
  ["Isabela Freitas", "(21) 91555-9090", "isa@email.com"],
  ["Carla Mendes", "(21) 90444-1313", "carla@email.com"],
  ["Natália Gomes", "(21) 99333-2525", "nati@email.com"],
  ["Aline Castro", "(21) 98222-3737", "aline@email.com"],
  ["Priscila Rocha", "(21) 97111-4949", "pri@email.com"],
  ["Tatiane Lopes", "(21) 96000-5050", "tati@email.com"],
] as const;

const catalog = [
  {
    serviceId: "micropigmentacao-fio",
    serviceName: "Micropigmentação Fio a Fio",
    professionalId: "livia",
    professionalName: "Lívia Sodré",
    durationMin: 120,
    price: 450,
    category: "micropigmentacao" as ServiceCategory,
  },
  {
    serviceId: "nail-design",
    serviceName: "Nail Design Completo",
    professionalId: "ariany",
    professionalName: "Ariany",
    durationMin: 90,
    price: 80,
    category: "unhas" as ServiceCategory,
  },
  {
    serviceId: "ventosaterapia",
    serviceName: "Ventosaterapia",
    professionalId: "yame",
    professionalName: "Yamê",
    durationMin: 50,
    price: 100,
    category: "corporal" as ServiceCategory,
  },
  {
    serviceId: "manicure",
    serviceName: "Manicure Completa",
    professionalId: "luana",
    professionalName: "Luana",
    durationMin: 50,
    price: 45,
    category: "unhas" as ServiceCategory,
  },
  {
    serviceId: "limpeza-pele",
    serviceName: "Limpeza de Pele Profunda",
    professionalId: "yame",
    professionalName: "Yamê",
    durationMin: 75,
    price: 120,
    category: "facial" as ServiceCategory,
  },
  {
    serviceId: "botox-facial",
    serviceName: "Botox Facial",
    professionalId: "livia",
    professionalName: "Lívia Sodré",
    durationMin: 45,
    price: 650,
    category: "facial" as ServiceCategory,
  },
  {
    serviceId: "alongamento-cilios",
    serviceName: "Alongamento de Cílios",
    professionalId: "livia",
    professionalName: "Lívia Sodré",
    durationMin: 90,
    price: 150,
    category: "cilios" as ServiceCategory,
  },
  {
    serviceId: "design-sobrancelha",
    serviceName: "Design de Sobrancelhas",
    professionalId: "livia",
    professionalName: "Lívia Sodré",
    durationMin: 40,
    price: 45,
    category: "cilios" as ServiceCategory,
  },
  {
    serviceId: "spa-maos",
    serviceName: "Spa das Mãos",
    professionalId: "luana",
    professionalName: "Luana",
    durationMin: 60,
    price: 70,
    category: "unhas" as ServiceCategory,
  },
  {
    serviceId: "acupuntura",
    serviceName: "Acupuntura",
    professionalId: "yame",
    professionalName: "Yamê",
    durationMin: 60,
    price: 150,
    category: "corporal" as ServiceCategory,
  },
  {
    serviceId: "depilacao-completa",
    serviceName: "Depilação Completa",
    professionalId: "yame",
    professionalName: "Yamê",
    durationMin: 60,
    price: 90,
    category: "depilacao" as ServiceCategory,
  },
] as const;

const statuses: Appointment["status"][] = [
  "scheduled",
  "confirmed",
  "confirmed",
  "in_progress",
  "finished",
  "cancelled",
  "no_show",
  "rescheduled",
];
const payments: Appointment["paymentStatus"][] = [
  "pending",
  "paid",
  "paid",
  "pending",
];
const methods = ["PIX", "Cartão", "Dinheiro", "Transferência"] as const;

export const monthlyInsights = [
  { monthLabel: "Fev", revenue: 12800, appointments: 42 },
  { monthLabel: "Mar", revenue: 15240, appointments: 51 },
  { monthLabel: "Abr", revenue: 14110, appointments: 47 },
  { monthLabel: "Mai", revenue: 17890, appointments: 58 },
  { monthLabel: "Jun", revenue: 19650, appointments: 63 },
  { monthLabel: "Jul", revenue: 21420, appointments: 71 },
];

export const recentReviews = [
  {
    id: "rv-1",
    clientName: "Fernanda M.",
    rating: 5,
    text: "Atendimento impecável. Saí me sentindo renovada.",
    serviceName: "Limpeza de Pele",
    date: "2026-07-26",
  },
  {
    id: "rv-2",
    clientName: "Patricia S.",
    rating: 5,
    text: "A Ariany fez um nail design perfeito. Voltarei!",
    serviceName: "Nail Design",
    date: "2026-07-25",
  },
  {
    id: "rv-3",
    clientName: "Amanda R.",
    rating: 5,
    text: "A Yamê é incrível — ventosa e acolhimento de outro nível.",
    serviceName: "Ventosaterapia",
    date: "2026-07-24",
  },
  {
    id: "rv-4",
    clientName: "Larissa T.",
    rating: 5,
    text: "Micropigmentação naturalíssima. Super recomendo a Lívia.",
    serviceName: "Micropigmentação",
    date: "2026-07-22",
  },
];

export const occupancyByHour = [
  { hour: "09h", pct: 45 },
  { hour: "10h", pct: 78 },
  { hour: "11h", pct: 92 },
  { hour: "12h", pct: 60 },
  { hour: "14h", pct: 88 },
  { hour: "15h", pct: 95 },
  { hour: "16h", pct: 84 },
  { hour: "17h", pct: 70 },
  { hour: "18h", pct: 55 },
];

export function buildMockAppointments(): Appointment[] {
  const today = startOfDay(nowInClinic());
  /** Horário local da clínica → ISO UTC correto (funciona no Vercel UTC) */
  const iso = (dayOffset: number, h: number, m = 0) => {
    const local = setMinutes(setHours(addDays(today, dayOffset), h), m);
    return fromClinicLocal(local).toISOString();
  };

  // denser set for calendar demo (~48)
  return Array.from({ length: 48 }, (_, i) => {
    const client = clients[i % clients.length];
    const svc = catalog[i % catalog.length];
    const status = statuses[i % statuses.length];
    const paymentStatus =
      status === "cancelled" || status === "no_show"
        ? "pending"
        : status === "finished"
          ? "paid"
          : payments[i % payments.length];
    const dayOffset = (i % 14) - 4;
    const hour = 8 + (i % 10); // 08h–17h no fuso da clínica
    const room = rooms[i % rooms.length];
    const fromServices = services.find((s) => s.id === svc.serviceId);
    return {
      id: `apt-${String(i + 1).padStart(3, "0")}`,
      clientName: client[0],
      clientPhone: client[1],
      clientEmail: client[2],
      clientPhoto: undefined,
      serviceId: svc.serviceId,
      serviceName: svc.serviceName,
      category: fromServices?.category ?? svc.category,
      professionalId: svc.professionalId,
      professionalName: svc.professionalName,
      roomId: room.id,
      roomName: room.name,
      startsAt: iso(dayOffset, hour, (i % 4) * 15),
      durationMin: svc.durationMin,
      price: svc.price + (i % 3) * 10,
      status,
      notes:
        i % 5 === 0
          ? "Cliente preferencial"
          : i % 7 === 0
            ? "Primeira visita"
            : "",
      createdAt: iso(dayOffset - 2, 12),
      updatedAt: iso(dayOffset - 1, 10),
      paymentStatus,
      paymentMethod: methods[i % methods.length],
      history: [
        {
          id: `h-${i}-1`,
          date: iso(dayOffset - 30, 14),
          serviceName: catalog[(i + 2) % catalog.length].serviceName,
          professionalName: catalog[(i + 2) % catalog.length].professionalName,
          status: "finished",
        },
      ],
    } satisfies Appointment;
  });
}

export function buildMockBlocks(): CalendarBlock[] {
  const today = startOfDay(nowInClinic());
  const at = (dayOffset: number, h: number, m = 0) => {
    const local = setMinutes(setHours(addDays(today, dayOffset), h), m);
    return fromClinicLocal(local).toISOString();
  };
  return [
    {
      id: "blk-lunch-today",
      title: "Almoço",
      type: "lunch",
      startsAt: at(0, 12),
      endsAt: at(0, 13),
    },
    {
      id: "blk-meeting",
      title: "Reunião de equipe",
      type: "meeting",
      professionalId: "livia",
      startsAt: at(1, 18),
      endsAt: at(1, 19),
    },
    {
      id: "blk-course",
      title: "Curso micropigmentação",
      type: "course",
      professionalId: "livia",
      startsAt: at(3, 9),
      endsAt: at(3, 12),
    },
  ];
}

export function categoryForService(serviceId: string): ServiceCategory {
  return services.find((s) => s.id === serviceId)?.category ?? "facial";
}
