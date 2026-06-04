import { InsightsPage } from "@/components/ops-dashboard";
import {
  getDashboardCustomers,
  getDashboardInvoices,
  getDashboardJobs,
  getDashboardQuotes,
} from "@/lib/dashboard-data";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("insights", "/dashboard/insights");
  const [liveCustomers, liveJobs, liveQuotes, liveInvoices] = await Promise.all([
    getDashboardCustomers(),
    getDashboardJobs(),
    getDashboardQuotes(),
    getDashboardInvoices(),
  ]);

  return (
    <InsightsPage
      liveCustomers={liveCustomers}
      liveJobs={liveJobs}
      liveQuotes={liveQuotes}
      liveInvoices={liveInvoices}
      role={role}
    />
  );
}
