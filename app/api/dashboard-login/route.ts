import { NextRequest, NextResponse } from "next/server";
import {
  createDashboardSessionValue,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
  getDashboardRoleForPassword,
  isDashboardPasswordConfigured,
} from "@/lib/dashboard-auth";
import {
  canAccessDashboardPath,
  getDashboardRoleHome,
} from "@/lib/dashboard-permissions";

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/dashboard") || value.startsWith("//")) {
    return "/dashboard";
  }
  if (value.startsWith("/dashboard/login")) return "/dashboard";

  return value;
}

function redirectToLogin(request: NextRequest, nextPath: string) {
  const loginUrl = new URL("/dashboard/login", request.url);
  loginUrl.searchParams.set("error", "1");
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = safeNextPath(formData.get("next"));

  if (!isDashboardPasswordConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
    }

    return new NextResponse("Dashboard password is not configured.", {
      status: 503,
    });
  }

  const role = typeof password === "string" ? getDashboardRoleForPassword(password) : null;
  if (!role) {
    return redirectToLogin(request, nextPath);
  }

  const session = await createDashboardSessionValue(role);
  if (!session) {
    return new NextResponse("Dashboard session could not be created.", {
      status: 500,
    });
  }

  const destination = canAccessDashboardPath(role, nextPath)
    ? nextPath
    : getDashboardRoleHome(role);

  const response = NextResponse.redirect(new URL(destination, request.url), {
    status: 303,
  });
  response.cookies.set(DASHBOARD_SESSION_COOKIE, session, {
    httpOnly: true,
    maxAge: DASHBOARD_SESSION_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
