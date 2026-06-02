import { HomeDashboardPage } from "@/components/ops-dashboard";
import {
  getDashboardCustomers,
  getDashboardInvoices,
  getDashboardJobs,
  getDashboardQuotes,
} from "@/lib/dashboard-data";
import { getQuoteRequests } from "@/lib/quote-requests";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [liveCustomers, liveJobs, liveQuotes, liveInvoices, liveRequests] = await Promise.all([
    getDashboardCustomers(),
    getDashboardJobs(),
    getDashboardQuotes(),
    getDashboardInvoices(),
    getQuoteRequests().catch(() => []),
  ]);

  return (
    <HomeDashboardPage
      liveCustomers={liveCustomers}
      liveJobs={liveJobs}
      liveQuotes={liveQuotes}
      liveInvoices={liveInvoices}
      liveRequestCount={liveRequests.length}
    />
  );
}
