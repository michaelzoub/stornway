import { JobsPage } from "@/components/ops-dashboard";
import { getDashboardJobs } from "@/lib/dashboard-data";
import {
  getDashboardTechnicianCrew,
  requireDashboardRole,
} from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function Page() {
  const role = await requireDashboardRole("jobs", "/dashboard/jobs");
  const jobs = await getDashboardJobs();
  const technicianCrew = getDashboardTechnicianCrew();
  const liveJobs =
    role === "TECHNICIAN" && technicianCrew
      ? jobs.filter((job) => job.crew.toLowerCase() === technicianCrew)
      : jobs;

  return <JobsPage liveJobs={liveJobs} role={role} />;
}
