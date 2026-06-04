import { NextRequest, NextResponse } from "next/server";
import {
  DASHBOARD_SESSION_COOKIE,
  isDashboardPasswordConfigured,
  verifyDashboardSession,
} from "@/lib/dashboard-auth";
import {
  canAccessDashboardPath,
  getDashboardRoleHome,
} from "@/lib/dashboard-permissions";

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

  if (isLocalDevelopmentRequest(request) && !isDashboardPasswordConfigured()) {
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

  const role = await verifyDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value,
  );

  if (role && canAccessDashboardPath(role, pathname)) {
    return NextResponse.next();
  }

  if (role) {
    return NextResponse.redirect(new URL(getDashboardRoleHome(role), request.url));
  }

  const loginUrl = new URL("/dashboard/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/dashboard/:path*",
};
