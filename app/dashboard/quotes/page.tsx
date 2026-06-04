import { QuotesPage } from "@/components/ops-dashboard";
import { getDashboardQuotes } from "@/lib/dashboard-data";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("quotes", "/dashboard/quotes");
  const liveQuotes = await getDashboardQuotes();
  return <QuotesPage liveQuotes={liveQuotes} role={role} />;
}
