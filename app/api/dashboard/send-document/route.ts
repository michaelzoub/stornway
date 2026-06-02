import { NextResponse } from "next/server";
import {
  escapeHtml,
  getOptionalFormString,
  readDashboardFormData,
  sendDashboardEmail,
  updateInvoiceStatusByNumber,
  updateQuoteStatusByNumber,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export async function POST(request: Request) {
  const formData = await readDashboardFormData(request);
  if (!formData) {
    return NextResponse.redirect(new URL("/dashboard?error=form-data", request.url), 303);
  }
  const documentType = getOptionalFormString(formData, "document_type");
  const documentNumber = getOptionalFormString(formData, "document_number");
  const to = getOptionalFormString(formData, "to");
  const subject = getOptionalFormString(formData, "subject");
  const message = getOptionalFormString(formData, "message");
  const returnTo = getOptionalFormString(formData, "return_to") || "/dashboard/quotes";

  if (!to || !subject || !message || !documentType || !documentNumber) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=send-fields`, request.url),
      303,
    );
  }

  try {
    await sendDashboardEmail({
      to,
      subject,
      html: `
        <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
        <hr />
        <p><strong>${escapeHtml(documentType)}:</strong> ${escapeHtml(documentNumber)}</p>
      `,
    });

    if (documentType === "Quote") {
      await updateQuoteStatusByNumber(documentNumber, "sent");
    }

    if (documentType === "Invoice") {
      await updateInvoiceStatusByNumber(documentNumber, "sent");
    }
  } catch (error) {
    console.error("[dashboard/send-document] Send failed:", error);
    return NextResponse.redirect(
      new URL(`${returnTo}?error=email-send`, request.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL(`${returnTo}?sent=email`, request.url),
    303,
  );
}
