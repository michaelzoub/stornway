import { NextRequest, NextResponse } from "next/server";
import {
  DASHBOARD_SESSION_COOKIE,
  isDashboardPasswordConfigured,
  verifyDashboardSession,
} from "@/lib/dashboard-auth";

function isLocalDevelopmentRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return false;

  const hostname = request.nextUrl.hostname.toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isLocalDevelopmentRequest(request)) {
    return NextResponse.next();
  }

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
