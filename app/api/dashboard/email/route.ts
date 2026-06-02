import { NextResponse } from "next/server";
import { markQuoteRequestEmailSent } from "@/lib/quote-requests";
import {
  escapeHtml,
  getOptionalFormString,
  sendDashboardEmail,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
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

  await sendDashboardEmail({
    to,
    subject,
    html: `<p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>`,
  });

  if (quoteRequestId) {
    await markQuoteRequestEmailSent(quoteRequestId);
  }

  return NextResponse.redirect(
    new URL("/dashboard/requests?sent=email", request.url),
    303,
  );
}
