import { addDays, format, setHours, setMinutes, startOfDay } from "date-fns";
import { categoryLabels } from "@/data/services";
import { team } from "@/data/team";
import { monthlyInsights } from "@/data/dashboard-mock";
import { fromClinicLocal, nowInClinic } from "@/lib/calendar/time";
import type { Appointment } from "@/lib/types";
import type {
  AiInsight,
  ClientPulse,
  KpiItem,
  TeamLiveCard,
} from "@/lib/control-center/types";
import type { ServiceCategory } from "@/data/services";

/** Demo seed — always fills the control center with rich clinic data */
export function buildControlCenterMock() {
  const now = nowInClinic();
  const todayStart = startOfDay(now);

  const at = (h: number, m = 0) =>
    fromClinicLocal(setMinutes(setHours(todayStart, h), m)).toISOString();

  const dayAgenda: Appointment[] = [
    {
      id: "mock-d01",
      clientName: "Mariana Costa",
      clientPhone: "(21) 98888-1111",
      clientEmail: "mariana@email.com",
      serviceId: "limpeza-pele",
      serviceName: "Limpeza de Pele Profunda",
      category: "facial",
      professionalId: "yame",
      professionalName: "Yamê",
      roomId: "sala-01",
      roomName: "Sala 01",
      startsAt: at(9, 0),
      durationMin: 75,
      price: 120,
      status: "finished",
      notes: "Pele sensível",
      createdAt: at(8, 0),
      paymentStatus: "paid",
      paymentMethod: "PIX",
    },
    {
      id: "mock-d02",
      clientName: "Juliana Alves",
      clientPhone: "(21) 97777-2222",
      clientEmail: "ju@email.com",
      serviceId: "design-sobrancelha",
      serviceName: "Design de Sobrancelhas",
      category: "cilios",
      professionalId: "livia",
      professionalName: "Lívia Sodré",
      roomId: "sala-02",
      roomName: "Sala 02",
      startsAt: at(10, 0),
      durationMin: 40,
      price: 45,
      status: "finished",
      notes: "",
      createdAt: at(8, 10),
      paymentStatus: "paid",
      paymentMethod: "Cartão",
    },
    {
      id: "mock-d03",
      clientName: "Camila Rocha",
      clientPhone: "(21) 96666-3333",
      clientEmail: "camila@email.com",
      serviceId: "botox-facial",
      serviceName: "Botox Facial",
      category: "facial",
      professionalId: "livia",
      professionalName: "Lívia Sodré",
      roomId: "sala-botox",
      roomName: "Sala Botox",
      startsAt: at(11, 0),
      durationMin: 45,
      price: 650,
      status: "in_progress",
      notes: "Retoque 4 meses",
      createdAt: at(7, 30),
      paymentStatus: "pending",
      paymentMethod: "Cartão",
    },
    {
      id: "mock-d04",
      clientName: "Beatriz Lima",
      clientPhone: "(21) 95555-4444",
      clientEmail: "bia@email.com",
      serviceId: "nail-design",
      serviceName: "Nail Design Completo",
      category: "unhas",
      professionalId: "ariany",
      professionalName: "Ariany",
      roomId: "sala-02",
      roomName: "Sala 02",
      startsAt: at(11, 30),
      durationMin: 90,
      price: 95,
      status: "confirmed",
      notes: "",
      createdAt: at(9, 0),
      paymentStatus: "pending",
      paymentMethod: "PIX",
    },
    {
      id: "mock-d05",
      clientName: "Fernanda Melo",
      clientPhone: "(21) 99444-5555",
      clientEmail: "fe@email.com",
      serviceId: "ventosaterapia",
      serviceName: "Ventosaterapia",
      category: "corporal",
      professionalId: "yame",
      professionalName: "Yamê",
      roomId: "sala-corporal",
      roomName: "Sala Corporal",
      startsAt: at(14, 0),
      durationMin: 50,
      price: 100,
      status: "confirmed",
      notes: "",
      createdAt: at(10, 0),
      paymentStatus: "pending",
      paymentMethod: "Dinheiro",
    },
    {
      id: "mock-d06",
      clientName: "Patricia Souza",
      clientPhone: "(21) 98333-6666",
      clientEmail: "pati@email.com",
      serviceId: "micropigmentacao-fio",
      serviceName: "Micropigmentação Fio a Fio",
      category: "micropigmentacao",
      professionalId: "livia",
      professionalName: "Lívia Sodré",
      roomId: "sala-01",
      roomName: "Sala 01",
      startsAt: at(14, 30),
      durationMin: 120,
      price: 450,
      status: "scheduled",
      notes: "Primeira visita",
      createdAt: at(11, 0),
      paymentStatus: "pending",
      paymentMethod: "PIX",
    },
    {
      id: "mock-d07",
      clientName: "Amanda Ribeiro",
      clientPhone: "(21) 97222-7777",
      clientEmail: "amanda@email.com",
      serviceId: "alongamento-cilios",
      serviceName: "Alongamento de Cílios",
      category: "cilios",
      professionalId: "livia",
      professionalName: "Lívia Sodré",
      roomId: "sala-laser",
      roomName: "Sala Laser",
      startsAt: at(16, 0),
      durationMin: 90,
      price: 150,
      status: "confirmed",
      notes: "",
      createdAt: at(12, 0),
      paymentStatus: "pending",
      paymentMethod: "Cartão",
    },
    {
      id: "mock-d08",
      clientName: "Larissa Torres",
      clientPhone: "(21) 96111-8888",
      clientEmail: "lari@email.com",
      serviceId: "manicure",
      serviceName: "Manicure Completa",
      category: "unhas",
      professionalId: "luana",
      professionalName: "Luana",
      roomId: "sala-02",
      roomName: "Sala 02",
      startsAt: at(16, 30),
      durationMin: 50,
      price: 45,
      status: "scheduled",
      notes: "",
      createdAt: at(13, 0),
      paymentStatus: "pending",
      paymentMethod: "PIX",
    },
    {
      id: "mock-d09",
      clientName: "Gabriela Nunes",
      clientPhone: "(21) 95999-1212",
      clientEmail: "gabi@email.com",
      serviceId: "depilacao-completa",
      serviceName: "Depilação Completa",
      category: "depilacao",
      professionalId: "yame",
      professionalName: "Yamê",
      roomId: "sala-corporal",
      roomName: "Sala Corporal",
      startsAt: at(17, 30),
      durationMin: 60,
      price: 90,
      status: "cancelled",
      notes: "Remarcou",
      createdAt: at(9, 30),
      paymentStatus: "pending",
      paymentMethod: "A definir",
    },
    {
      id: "mock-d10",
      clientName: "Renata Dias",
      clientPhone: "(21) 94888-3434",
      clientEmail: "renata@email.com",
      serviceId: "spa-maos",
      serviceName: "Spa das Mãos",
      category: "unhas",
      professionalId: "luana",
      professionalName: "Luana",
      roomId: "sala-02",
      roomName: "Sala 02",
      startsAt: at(18, 0),
      durationMin: 40,
      price: 55,
      status: "rescheduled",
      notes: "",
      createdAt: at(14, 0),
      paymentStatus: "pending",
      paymentMethod: "PIX",
    },
  ];

  const active = dayAgenda.filter(
    (a) => a.status !== "cancelled" && a.status !== "no_show",
  );
  const by = (s: string) => dayAgenda.filter((a) => a.status === s).length;
  const expected = active.reduce((s, a) => s + a.price, 0);
  const received = dayAgenda
    .filter((a) => a.paymentStatus === "paid")
    .reduce((s, a) => s + a.price, 0);

  const kpis: KpiItem[] = [
    { id: "today", label: "Agendamentos hoje", value: active.length, format: "number", delta: 8, hint: "Mock · ativos do dia", tone: "info" },
    { id: "confirmed", label: "Confirmados", value: by("confirmed"), format: "number", delta: 5, hint: "Mock", tone: "success" },
    { id: "pending", label: "Pendentes", value: by("scheduled"), format: "number", hint: "Mock", tone: "warn" },
    { id: "in_progress", label: "Em atendimento", value: by("in_progress"), format: "number", hint: "Mock", tone: "info" },
    { id: "finished", label: "Finalizados", value: by("finished"), format: "number", hint: "Mock", tone: "success" },
    { id: "cancelled", label: "Cancelados", value: by("cancelled") + by("no_show"), format: "number", hint: "Mock", tone: "danger" },
    { id: "reschedule", label: "Reagendamentos", value: by("rescheduled"), format: "number", hint: "Mock" },
    { id: "free", label: "Horários livres", value: 11, format: "number", hint: "Mock · slots abertos" },
    { id: "occupancy", label: "Taxa de ocupação", value: 87, format: "percent", delta: 4, hint: "Mock", tone: "info" },
    { id: "avg", label: "Tempo médio", value: 62, format: "minutes", hint: "Mock" },
    { id: "expected", label: "Faturamento previsto", value: expected, format: "currency", delta: 14, hint: "Mock", tone: "success" },
    { id: "received", label: "Faturamento recebido", value: received, format: "currency", hint: "Mock", tone: "success" },
    { id: "ticket", label: "Ticket médio", value: 186, format: "currency", hint: "Mock" },
    { id: "pending_pay", label: "Pagamentos pendentes", value: expected - received, format: "currency", hint: "Mock", tone: "warn" },
    { id: "new_clients", label: "Novos clientes", value: 12, format: "number", delta: 18, hint: "Mock · semana" },
    { id: "returning", label: "Clientes recorrentes", value: 34, format: "number", hint: "Mock" },
    { id: "return_rate", label: "Taxa de retorno", value: 71, format: "percent", delta: 3, hint: "Mock · 90 dias" },
    { id: "reviews", label: "Avaliações", value: 128, format: "number", hint: "Mock" },
    { id: "messages", label: "Msgs pendentes", value: 9, format: "number", hint: "Mock · WhatsApp", tone: "warn" },
    { id: "commission", label: "Comissões do dia", value: Math.round(received * 0.35), format: "currency", hint: "Mock · 35%" },
    { id: "alerts", label: "Alertas importantes", value: 4, format: "number", hint: "Mock", tone: "danger" },
    { id: "vip", label: "Clientes VIP hoje", value: 3, format: "number", hint: "Mock" },
  ];

  const teamLive: TeamLiveCard[] = team.map((p, i) => {
    const presets = [
      { status: "busy" as const, goalPct: 92, occupancy: 88, done: 4, revenue: 1280, commission: 448, hours: 6.5, rating: 4.95 },
      { status: "available" as const, goalPct: 74, occupancy: 61, done: 3, revenue: 420, commission: 147, hours: 5, rating: 4.9 },
      { status: "busy" as const, goalPct: 81, occupancy: 79, done: 5, revenue: 380, commission: 133, hours: 6, rating: 4.85 },
      { status: "break" as const, goalPct: 58, occupancy: 45, done: 2, revenue: 140, commission: 49, hours: 4, rating: 4.8 },
    ];
    const pr = presets[i % presets.length];
    const next = dayAgenda.find(
      (a) =>
        a.professionalId === p.id &&
        (a.status === "confirmed" || a.status === "scheduled"),
    );
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      image: p.image,
      specialties: p.specialties,
      status: pr.status,
      nextClient: next?.clientName,
      nextAt: next?.startsAt,
      doneToday: pr.done,
      revenueToday: pr.revenue,
      commission: pr.commission,
      goalPct: pr.goalPct,
      occupancy: pr.occupancy,
      rating: pr.rating,
      hoursWorked: pr.hours,
      avgMin: 55 + i * 5,
    };
  });

  const clients: ClientPulse[] = [
    { id: "c1", name: "Helena Prado", phone: "(21) 92666-7878", tag: "vip", lastVisit: at(10), ltv: 4200, favorite: "Botox Facial" },
    { id: "c2", name: "Sofia Martins", phone: "(21) 93777-5656", tag: "frequente", lastVisit: at(11), ltv: 1890, favorite: "Limpeza de Pele" },
    { id: "c3", name: "Isabela Freitas", phone: "(21) 91555-9090", tag: "novo", lastVisit: at(14), ltv: 150, favorite: "Design de Sobrancelhas" },
    { id: "c4", name: "Carla Mendes", phone: "(21) 90444-1313", tag: "aniversario", lastVisit: addDays(todayStart, -3).toISOString(), ltv: 980, favorite: "Nail Design" },
    { id: "c5", name: "Natália Gomes", phone: "(21) 99333-2525", tag: "inativo", lastVisit: addDays(todayStart, -110).toISOString(), ltv: 640, favorite: "Ventosaterapia" },
    { id: "c6", name: "Aline Castro", phone: "(21) 98222-3737", tag: "vip", lastVisit: at(16), ltv: 5100, favorite: "Micropigmentação" },
    { id: "c7", name: "Priscila Rocha", phone: "(21) 97111-4949", tag: "frequente", lastVisit: addDays(todayStart, -7).toISOString(), ltv: 1320, favorite: "Alongamento de Cílios" },
    { id: "c8", name: "Tatiane Lopes", phone: "(21) 96000-5050", tag: "novo", lastVisit: at(9), ltv: 120, favorite: "Manicure Completa" },
    { id: "c9", name: "Mariana Costa", phone: "(21) 98888-1111", tag: "frequente", lastVisit: at(9), ltv: 2100, favorite: "Limpeza de Pele" },
    { id: "c10", name: "Juliana Alves", phone: "(21) 97777-2222", tag: "vip", lastVisit: at(10), ltv: 3600, favorite: "Botox Facial" },
    { id: "c11", name: "Camila Rocha", phone: "(21) 96666-3333", tag: "frequente", lastVisit: at(11), ltv: 2750, favorite: "Micropigmentação" },
    { id: "c12", name: "Beatriz Lima", phone: "(21) 95555-4444", tag: "aniversario", lastVisit: at(11, 30), ltv: 880, favorite: "Nail Design" },
  ];

  const insights: AiInsight[] = [
    { id: "i1", tag: "Agenda", severity: "warn", text: "Hoje existem 3 horários vagos entre 14h e 16h — oportunidade para encaixe rápido." },
    { id: "i2", tag: "Procedimentos", severity: "success", text: "O Botox aumentou 25% em relação à semana passada." },
    { id: "i3", tag: "Equipe", severity: "success", text: "A profissional Lívia atingiu 92% da meta do dia." },
    { id: "i4", tag: "Retenção", severity: "critical", text: "Cinco clientes estão há mais de 90 dias sem retornar." },
    { id: "i5", tag: "Confirmações", severity: "warn", text: "Há duas confirmações pendentes para o período da tarde." },
    { id: "i6", tag: "Ocupação", severity: "info", text: "A taxa de ocupação da clínica está em 87%." },
    { id: "i7", tag: "Categoria", severity: "info", text: `${categoryLabels.facial} é a categoria mais procurada neste mês.` },
    { id: "i8", tag: "Risco", severity: "warn", text: "Existe risco de o horário das 15h ficar ocioso na Sala Corporal." },
    { id: "i9", tag: "Financeiro", severity: "success", text: "Faturamento previsto de hoje já supera a média dos últimos 7 dias." },
    { id: "i10", tag: "CRM", severity: "info", text: "9 mensagens no WhatsApp aguardam resposta da recepção." },
  ];

  const proceduresRank = [
    { name: "Botox Facial", count: 14, revenue: 9100, duration: 45 },
    { name: "Limpeza de Pele Profunda", count: 18, revenue: 2160, duration: 75 },
    { name: "Micropigmentação Fio a Fio", count: 9, revenue: 4050, duration: 120 },
    { name: "Nail Design Completo", count: 16, revenue: 1280, duration: 90 },
    { name: "Alongamento de Cílios", count: 12, revenue: 1800, duration: 90 },
    { name: "Ventosaterapia", count: 11, revenue: 1100, duration: 50 },
    { name: "Design de Sobrancelhas", count: 22, revenue: 990, duration: 40 },
    { name: "Depilação Completa", count: 8, revenue: 720, duration: 60 },
  ];

  const categoriesRank = (
    Object.keys(categoryLabels) as ServiceCategory[]
  ).map((id, i) => ({
    id,
    label: categoryLabels[id],
    count: [28, 19, 22, 31, 24, 12][i] || 10,
  }));

  const nextAppointment =
    dayAgenda.find(
      (a) =>
        new Date(a.startsAt) >= now &&
        a.status !== "cancelled" &&
        a.status !== "finished",
    ) || dayAgenda.find((a) => a.status === "in_progress") || null;

  return {
    generatedAt: now.toISOString(),
    mock: true as const,
    nextAppointment,
    kpis,
    teamLive,
    clients,
    insights,
    commercial: {
      leads: 47,
      conversion: 38,
      bookings: active.length,
      confirmations: by("confirmed"),
      cancellations: by("cancelled"),
      noShow: 1,
      reschedules: by("rescheduled"),
      recovered: 6,
      channels: [
        { name: "Instagram", value: 41 },
        { name: "WhatsApp", value: 27 },
        { name: "Indicação", value: 19 },
        { name: "Google", value: 13 },
      ],
    },
    proceduresRank,
    categoriesRank,
    financeSeries: monthlyInsights.map((m) => ({
      month: m.monthLabel,
      revenue: m.revenue,
      appointments: m.appointments,
    })),
    dayAgenda,
    notifications: [
      { id: "n1", type: "booking" as const, title: "Novo agendamento", message: "Patricia Souza · Micropigmentação 14:30", at: at(11) },
      { id: "n2", type: "payment" as const, title: "Pagamento pendente", message: "Camila Rocha · Botox · R$ 650", at: at(11, 5) },
      { id: "n3", type: "birthday" as const, title: "Aniversariantes", message: "Carla Mendes e Beatriz Lima esta semana", at: at(8) },
      { id: "n4", type: "booking" as const, title: "Cancelamento", message: "Gabriela Nunes cancelou Depilação 17:30", at: at(12) },
      { id: "n5", type: "booking" as const, title: "Cliente aguardando", message: "Beatriz Lima na recepção · Nail Design", at: at(11, 25) },
      { id: "n6", type: "payment" as const, title: "Mensagens", message: "9 conversas no WhatsApp sem resposta", at: at(13) },
    ],
    finance: {
      day: expected,
      week: 18640,
      month: 21420,
      year: 198500,
      receivable: expected - received + 2840,
      payable: 4150,
      ticket: 186,
      byPro: [
        { name: "Lívia Sodré", count: 18, revenue: 9840 },
        { name: "Yamê", count: 14, revenue: 3120 },
        { name: "Ariany", count: 16, revenue: 1680 },
        { name: "Luana", count: 12, revenue: 920 },
      ],
    },
    meta: {
      topPro: "Lívia Sodré",
      topSvc: "Design de Sobrancelhas",
      occupancy: 87,
      todayLabel: format(now, "EEEE, d MMM"),
    },
  };
}
