import { NextRequest, NextResponse } from "next/server";
import {
  DASHBOARD_SESSION_COOKIE,
  isDashboardPasswordConfigured,
  verifyDashboardSession,
} from "@/lib/dashboard-auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isDashboardPasswordConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Dashboard password is not configured.", {
        status: 503,
      });
    }

    return NextResponse.next();
  }

  if (pathname === "/dashboard/login") return NextResponse.next();

  const isAuthorized = await verifyDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value,
  );

  if (isAuthorized) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/dashboard/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/dashboard/:path*",
};
