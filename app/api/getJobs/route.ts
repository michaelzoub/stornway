import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ body: [] });
  } catch (error) {
    console.error("[getJobs] error:", error);
    return NextResponse.json({ body: [] }, { status: 500 });
  }
}
