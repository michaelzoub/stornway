import { NextResponse, type NextRequest } from "next/server";
import { requireDashboardApiRole } from "@/lib/dashboard-api-access";
import {
  getOptionalFormString,
  readDashboardFormData,
  updateJobStatus,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/jobs", request.url));
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardApiRole(
    request,
    ["ADMIN", "TECHNICIAN"],
    "/dashboard/jobs",
  );
  if (auth instanceof NextResponse) return auth;

  const formData = await readDashboardFormData(request);
  if (!formData) {
    return NextResponse.redirect(
      new URL("/dashboard/jobs?error=form-data", request.url),
      303,
    );
  }

  const jobId = getOptionalFormString(formData, "job_id");
  if (!jobId) {
    return NextResponse.redirect(
      new URL("/dashboard/jobs?error=job-status-fields", request.url),
      303,
    );
  }

  try {
    await updateJobStatus(jobId, "completed");
  } catch (error) {
    console.error("[dashboard/jobs/status] Job status update failed:", error);
    return NextResponse.redirect(
      new URL("/dashboard/jobs?error=job-status-save", request.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard/jobs?updated=job", request.url),
    303,
  );
}
