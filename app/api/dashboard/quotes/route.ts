import { NextResponse } from "next/server";
import { markQuoteRequestEmailSent } from "@/lib/quote-requests";
import {
  createQuote,
  escapeHtml,
  getClientFromForm,
  getLineItemsFromForm,
  getLineItemsTotal,
  getOptionalFormString,
  readDashboardFormData,
  sendDashboardEmail,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/dashboard/quotes", request.url));
}

export async function POST(request: Request) {
  const formData = await readDashboardFormData(request);
  if (!formData) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=form-data", request.url),
      303,
    );
  }
  const client = getClientFromForm(formData);
  const lineItems = getLineItemsFromForm(formData);
  const firstLineItem = lineItems[0];
  const quoteRequestId = getOptionalFormString(formData, "quote_request_id");
  const serviceType =
    getOptionalFormString(formData, "service_type") || firstLineItem.productService;

  if (!client.name || !firstLineItem.productService || getLineItemsTotal(lineItems) <= 0) {
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=quote-fields", request.url),
      303,
    );
  }

  let quote: Awaited<ReturnType<typeof createQuote>>;
  try {
    quote = await createQuote({
      client,
      quoteRequestId,
      serviceType,
      lineItems,
      status: formData.get("send_email") === "on" ? "sent" : "draft",
    });
  } catch (error) {
    console.error("[dashboard/quotes] Quote save failed:", error);
    return NextResponse.redirect(
      new URL("/dashboard/requests?error=quote-save", request.url),
      303,
    );
  }

  if (formData.get("send_email") === "on" && client.email) {
    const total = getLineItemsTotal(lineItems);
    const itemSummary = lineItems
      .map((item) => `${item.quantity} x ${escapeHtml(item.productService)} (${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.quantity * item.unitPrice)})`)
      .join("<br />");

    try {
      await sendDashboardEmail({
        to: client.email,
        subject: `Stornway ${quote.quote_number}`,
        html: `
          <p>Hi ${escapeHtml(client.name)},</p>
          <p>Here is your Stornway estimate: <strong>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</strong>.</p>
          <p>${itemSummary}</p>
          <p>Reply here with any questions or to approve the quote.</p>
          <p>Stornway Group</p>
        `,
      });
    } catch (error) {
      console.error("[dashboard/quotes] Quote email failed:", error);
      return NextResponse.redirect(
        new URL("/dashboard/quotes?created=quote&error=email-send", request.url),
        303,
      );
    }

    if (quoteRequestId) {
      await markQuoteRequestEmailSent(quoteRequestId);
    }
  }

  return NextResponse.redirect(
    new URL(
      formData.get("send_email") === "on"
        ? "/dashboard/quotes?created=quote&sent=email"
        : "/dashboard/quotes?created=quote",
      request.url,
    ),
    303,
  );
}
