import { NextResponse, type NextRequest } from "next/server";
import { requireDashboardApiRole } from "@/lib/dashboard-api-access";
import {
  escapeHtml,
  getDashboardDocumentAttachment,
  getDashboardEmailErrorCode,
  getInvoiceDocumentByNumber,
  getOptionalFormString,
  getQuoteDocumentByNumber,
  readDashboardFormData,
  renderDashboardDocumentEmail,
  sendDashboardEmail,
  updateInvoiceStatusByNumber,
  updateQuoteStatusByNumber,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardApiRole(
    request,
    ["ADMIN", "SALESPERSON"],
    "/dashboard/quotes",
  );
  if (auth instanceof NextResponse) return auth;

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
    const storedDocument =
      documentType === "Invoice"
        ? await getInvoiceDocumentByNumber(documentNumber)
        : documentType === "Quote"
          ? await getQuoteDocumentByNumber(documentNumber)
          : null;

    await sendDashboardEmail({
      to,
      subject,
      html: storedDocument
        ? renderDashboardDocumentEmail({
            message,
            document: storedDocument,
          })
        : `
          <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
          <hr />
          <p><strong>${escapeHtml(documentType)}:</strong> ${escapeHtml(documentNumber)}</p>
        `,
      attachments: storedDocument ? [getDashboardDocumentAttachment(storedDocument)] : undefined,
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
      new URL(`${returnTo}?error=${getDashboardEmailErrorCode(error)}`, request.url),
      303,
    );
  }

  return NextResponse.redirect(
    new URL(`${returnTo}?sent=email`, request.url),
    303,
  );
}
