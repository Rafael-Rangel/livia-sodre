import {
  getFinancialSummary,
  listAppointments,
} from "@/lib/appointments";
import { formatPrice } from "@/data/services";
import { OverviewClient } from "@/components/dashboard/OverviewClient";

export default async function DashboardHomePage() {
  const summary = getFinancialSummary();
  const all = listAppointments();
  const upcoming = all
    .filter((a) => a.status !== "cancelled" && a.status !== "completed")
    .slice(0, 6);

  const cards = [
    { label: "Receita confirmada", value: formatPrice(summary.revenue) },
    { label: "A receber", value: formatPrice(summary.pendingAmount) },
    { label: "Agendamentos", value: String(summary.totalAppointments) },
    { label: "Confirmados", value: String(summary.confirmed) },
  ];

  return (
    <OverviewClient
      cards={cards}
      upcoming={upcoming}
      byProfessional={summary.byProfessional}
      totals={{
        confirmed: summary.confirmed,
        completed: summary.completed,
        cancelled: summary.cancelled,
        pending: all.filter((a) => a.status === "pending").length,
      }}
    />
  );
}
