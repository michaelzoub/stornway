import { InsightsPage } from "@/components/ops-dashboard";
import {
  getDashboardCustomers,
  getDashboardInvoices,
  getDashboardJobs,
  getDashboardQuotes,
} from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Page() {
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
    />
  );
}
