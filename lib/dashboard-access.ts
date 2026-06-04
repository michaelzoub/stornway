import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DASHBOARD_SESSION_COOKIE,
  isDashboardPasswordConfigured,
  type DashboardRole,
  verifyDashboardSession,
} from "@/lib/dashboard-auth";
import {
  canAccessDashboardModule,
  getDashboardRoleHome,
  type DashboardModule,
} from "@/lib/dashboard-permissions";

export async function getDashboardRoleFromCookie(): Promise<DashboardRole | null> {
  if (!isDashboardPasswordConfigured() && process.env.NODE_ENV !== "production") {
    return "ADMIN";
  }

  const cookieStore = await cookies();
  return verifyDashboardSession(cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value);
}

export async function requireDashboardRole(
  module: DashboardModule,
  nextPath: string,
): Promise<DashboardRole> {
  const role = await getDashboardRoleFromCookie();

  if (!role) {
    redirect(`/dashboard/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!canAccessDashboardModule(role, module)) {
    redirect(getDashboardRoleHome(role));
  }

  return role;
}

export function getDashboardTechnicianCrew() {
  return process.env.DASHBOARD_TECHNICIAN_CREW?.trim().toLowerCase() || "";
}
