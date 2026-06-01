import { InvoicesPage } from "@/components/ops-dashboard";
import { getDashboardInvoices } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveInvoices = await getDashboardInvoices();
  return <InvoicesPage liveInvoices={liveInvoices} />;
}
