import { NextResponse, type NextRequest } from "next/server";
import { requireDashboardApiRole } from "@/lib/dashboard-api-access";
import { markQuoteRequestEmailSent } from "@/lib/quote-requests";
import {
  escapeHtml,
  getDashboardEmailErrorCode,
  getOptionalFormString,
  readDashboardFormData,
  sendDashboardEmail,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/requests", request.url));
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardApiRole(
    request,
    ["ADMIN", "SALESPERSON"],
    "/dashboard/requests",
  );
  if (auth instanceof NextResponse) return auth;

  const formData = await readDashboardFormData(request);
  if (!formData) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=form-data", request.url),
      303,
    );
  }
  const to = getOptionalFormString(formData, "to");
  const subject = getOptionalFormString(formData, "subject");
  const message = getOptionalFormString(formData, "message");
  const quoteRequestId = getOptionalFormString(formData, "quote_request_id");

  if (!to || !subject || !message) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=email-fields", request.url),
      303,
    );
  }

  try {
    await sendDashboardEmail({
      to,
      subject,
      html: `<p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>`,
    });
  } catch (error) {
    console.error("[dashboard/email] Send failed:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/requests?error=${getDashboardEmailErrorCode(error)}`, request.url),
      303,
    );
  }

  if (quoteRequestId) {
    await markQuoteRequestEmailSent(quoteRequestId);
  }

  return NextResponse.redirect(
    new URL("/dashboard/requests?sent=email", request.url),
    303,
  );
}
