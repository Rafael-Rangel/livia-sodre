import { getFinancialSummary } from "@/lib/appointments";
import { team } from "@/data/team";
import { ProfissionaisClient } from "@/components/dashboard/ProfissionaisClient";

export default async function ProfissionaisPage() {
  const summary = getFinancialSummary();
  const stats = Object.fromEntries(
    summary.byProfessional.map((p) => [p.name, p]),
  );

  return (
    <ProfissionaisClient
      team={team.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        image: p.image,
        specialties: p.specialties,
      }))}
      stats={stats}
    />
  );
}
