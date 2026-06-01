import { JobsPage } from "@/components/ops-dashboard";
import { getDashboardJobs } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveJobs = await getDashboardJobs();
  return <JobsPage liveJobs={liveJobs} />;
}
