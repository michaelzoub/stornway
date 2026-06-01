import { HomeDashboardPage } from "@/components/ops-dashboard";
import {
  getDashboardCustomers,
  getDashboardInvoices,
  getDashboardJobs,
  getDashboardQuotes,
} from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [liveCustomers, liveJobs, liveQuotes, liveInvoices] = await Promise.all([
    getDashboardCustomers(),
    getDashboardJobs(),
    getDashboardQuotes(),
    getDashboardInvoices(),
  ]);

  return (
    <HomeDashboardPage
      liveCustomers={liveCustomers}
      liveJobs={liveJobs}
      liveQuotes={liveQuotes}
      liveInvoices={liveInvoices}
    />
  );
}
