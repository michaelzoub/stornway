import { ClientsPage } from "@/components/ops-dashboard";
import { getDashboardCustomers } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveCustomers = await getDashboardCustomers();
  return <ClientsPage liveCustomers={liveCustomers} />;
}
