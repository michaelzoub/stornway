import { NextResponse } from "next/server";
import { markQuoteRequestEmailSent } from "@/lib/quote-requests";
import {
  createQuote,
  escapeHtml,
  getClientFromForm,
  getLineItemFromForm,
  getOptionalFormString,
  getTotal,
  sendDashboardEmail,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const client = getClientFromForm(formData);
  const lineItem = getLineItemFromForm(formData);
  const quoteRequestId = getOptionalFormString(formData, "quote_request_id");
  const serviceType =
    getOptionalFormString(formData, "service_type") || lineItem.productService;

  if (!client.name || !lineItem.productService || lineItem.unitPrice <= 0) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=quote-fields", request.url),
      303,
    );
  }

  const quote = await createQuote({
    client,
    quoteRequestId,
    serviceType,
    lineItem,
    status: formData.get("send_email") === "on" ? "sent" : "draft",
  });

  if (formData.get("send_email") === "on" && client.email) {
    const total = getTotal(lineItem);
    await sendDashboardEmail({
      to: client.email,
      subject: `Stornway ${quote.quote_number}`,
      html: `
        <p>Hi ${escapeHtml(client.name)},</p>
        <p>Here is your Stornway estimate for ${escapeHtml(lineItem.productService)}: <strong>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</strong>.</p>
        <p>${escapeHtml(lineItem.description || "Reply here with any questions or to approve the quote.")}</p>
        <p>Stornway Group</p>
      `,
    });

    if (quoteRequestId) {
      await markQuoteRequestEmailSent(quoteRequestId);
    }
  }

  return NextResponse.redirect(
    new URL("/dashboard/quotes?created=quote", request.url),
    303,
  );
}
