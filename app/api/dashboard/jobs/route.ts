import { NextResponse } from "next/server";
import { createJob, getJobFromForm } from "@/lib/dashboard-write";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const job = getJobFromForm(formData);

  if (!job.client.name || !job.serviceType || !job.scheduledStart) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=job-fields", request.url),
      303,
    );
  }

  try {
    await createJob(job);
  } catch (error) {
    console.error("[dashboard/jobs] Job create failed:", error);
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=job-save", request.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard/jobs?created=job", request.url),
    303,
  );
}
