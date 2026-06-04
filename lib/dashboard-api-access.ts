import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessDashboardPath,
  getDashboardRoleHome,
} from "@/lib/dashboard-permissions";
import {
  DASHBOARD_SESSION_COOKIE,
  isDashboardPasswordConfigured,
  type DashboardRole,
  verifyDashboardSession,
} from "@/lib/dashboard-auth";

export async function requireDashboardApiRole(
  request: NextRequest,
  allowedRoles: DashboardRole[],
  returnPath = "/dashboard",
): Promise<DashboardRole | NextResponse> {
  if (!isDashboardPasswordConfigured() && process.env.NODE_ENV !== "production") {
    return "ADMIN";
  }

  const role = await verifyDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value,
  );

  if (!role) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("next", returnPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(
      new URL(getDashboardRoleHome(role), request.url),
      303,
    );
  }

  return role;
}

export async function requireDashboardApiPathAccess(
  request: NextRequest,
  returnPath: string,
): Promise<DashboardRole | NextResponse> {
  if (!isDashboardPasswordConfigured() && process.env.NODE_ENV !== "production") {
    return "ADMIN";
  }

  const role = await verifyDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value,
  );

  if (!role) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("next", returnPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  if (!canAccessDashboardPath(role, returnPath)) {
    return NextResponse.redirect(
      new URL(getDashboardRoleHome(role), request.url),
      303,
    );
  }

  return role;
}
