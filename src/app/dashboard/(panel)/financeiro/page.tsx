import { getFinancialSummary, listAppointments } from "@/lib/appointments";
import { FinanceiroClient } from "@/components/dashboard/FinanceiroClient";
import { paymentMethodMock } from "@/components/dashboard/PaymentMethodCharts";

export default async function FinanceiroPage() {
  const summary = getFinancialSummary();
  const all = listAppointments();
  const paid = all.filter((a) => a.paymentStatus === "paid");
  const pending = all.filter(
    (a) => a.paymentStatus === "pending" && a.status !== "cancelled",
  );

  const methodMap = paid.reduce<
    Record<string, { method: string; total: number; count: number }>
  >((acc, a) => {
    const key = a.paymentMethod || "Outro";
    if (!acc[key]) acc[key] = { method: key, total: 0, count: 0 };
    acc[key].total += a.price;
    acc[key].count += 1;
    return acc;
  }, {});

  const fromStore = Object.values(methodMap).sort((a, b) => b.total - a.total);
  const methodBreakdown =
    fromStore.length >= 3
      ? fromStore
      : paymentMethodMock.map(({ method, total, count }) => ({
          method,
          total,
          count,
        }));

  return (
    <FinanceiroClient
      revenue={summary.revenue || 21420}
      pendingAmount={summary.pendingAmount || 3840}
      ticket={
        summary.completed
          ? Math.round(summary.revenue / Math.max(summary.completed, 1))
          : 186
      }
      paid={paid}
      pending={pending}
      methodBreakdown={methodBreakdown}
    />
  );
}
