import { ClientsPage } from "@/components/ops-dashboard";
import { getDashboardCustomers } from "@/lib/dashboard-data";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("clients", "/dashboard/clients");
  const liveCustomers = await getDashboardCustomers();
  return <ClientsPage liveCustomers={liveCustomers} role={role} />;
}
