import { InvoicesPage } from "@/components/ops-dashboard";
import { getDashboardInvoices } from "@/lib/dashboard-data";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("invoices", "/dashboard/invoices");
  const liveInvoices = await getDashboardInvoices();
  return <InvoicesPage liveInvoices={liveInvoices} role={role} />;
}
