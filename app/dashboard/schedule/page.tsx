import { SchedulePage } from "@/components/ops-dashboard";
import { getDashboardJobs } from "@/lib/dashboard-data";
import { requireDashboardRole } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("schedule", "/dashboard/schedule");
  const liveJobs = await getDashboardJobs();
  return <SchedulePage liveJobs={liveJobs} role={role} />;
}
