import {
  DASHBOARD_ROLE_LABELS,
  type DashboardRole,
} from "@/lib/dashboard-auth";

export type DashboardModule =
  | "home"
  | "schedule"
  | "clients"
  | "requests"
  | "quotes"
  | "jobs"
  | "invoices"
  | "insights";

const MODULE_ACCESS: Record<DashboardModule, DashboardRole[]> = {
  home: ["ADMIN"],
  schedule: ["ADMIN"],
  clients: ["ADMIN", "SALESPERSON"],
  requests: ["ADMIN", "SALESPERSON"],
  quotes: ["ADMIN", "SALESPERSON"],
  jobs: ["ADMIN", "TECHNICIAN"],
  invoices: ["ADMIN", "SALESPERSON"],
  insights: ["ADMIN"],
};

const ROLE_HOME: Record<DashboardRole, string> = {
  ADMIN: "/dashboard",
  SALESPERSON: "/dashboard/requests",
  TECHNICIAN: "/dashboard/jobs",
};

export function getDashboardRoleHome(role: DashboardRole) {
  return ROLE_HOME[role];
}

export function getDashboardRoleLabel(role: DashboardRole) {
  return DASHBOARD_ROLE_LABELS[role];
}

export function canAccessDashboardModule(role: DashboardRole, module: DashboardModule) {
  return MODULE_ACCESS[module].includes(role);
}

export function canAccessDashboardPath(role: DashboardRole, pathname: string) {
  if (pathname === "/dashboard") return canAccessDashboardModule(role, "home");
  if (pathname.startsWith("/dashboard/schedule")) return canAccessDashboardModule(role, "schedule");
  if (pathname.startsWith("/dashboard/clients")) return canAccessDashboardModule(role, "clients");
  if (pathname.startsWith("/dashboard/requests")) return canAccessDashboardModule(role, "requests");
  if (pathname.startsWith("/dashboard/quotes")) return canAccessDashboardModule(role, "quotes");
  if (pathname.startsWith("/dashboard/jobs")) return canAccessDashboardModule(role, "jobs");
  if (pathname.startsWith("/dashboard/invoices")) return canAccessDashboardModule(role, "invoices");
  if (pathname.startsWith("/dashboard/insights")) return canAccessDashboardModule(role, "insights");
  return role === "ADMIN";
}
