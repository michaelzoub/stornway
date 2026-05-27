import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD_SESSION_COOKIE } from "@/lib/dashboard-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/dashboard/login", request.url),
    { status: 303 },
  );
  response.cookies.set(DASHBOARD_SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/dashboard",
  });

  return response;
}
