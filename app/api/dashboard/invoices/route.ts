import { NextResponse, type NextRequest } from "next/server";
import { requireDashboardApiRole } from "@/lib/dashboard-api-access";
import {
  createInvoice,
  escapeHtml,
  getClientFromForm,
  getLineItemsFromForm,
  getLineItemsTotal,
  getOptionalFormString,
  readDashboardFormData,
  sendDashboardEmail,
  updateInvoiceStatus,
} from "@/lib/dashboard-write";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/invoices", request.url));
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardApiRole(
    request,
    ["ADMIN", "SALESPERSON"],
    "/dashboard/invoices",
  );
  if (auth instanceof NextResponse) return auth;

  const formData = await readDashboardFormData(request);
  if (!formData) {
    return NextResponse.redirect(
      new URL("/dashboard/invoices?error=form-data", request.url),
      303,
    );
  }
  const client = getClientFromForm(formData);
  const lineItems = getLineItemsFromForm(formData);
  const firstLineItem = lineItems[0];
  const shouldSend = formData.get("intent") === "save_send";

  if (!client.name || !firstLineItem.productService || getLineItemsTotal(lineItems) <= 0) {
    return NextResponse.redirect(
      new URL("/dashboard/invoices?error=invoice-fields", request.url),
      303,
    );
  }

  let invoice: Awaited<ReturnType<typeof createInvoice>>;
  try {
    invoice = await createInvoice({
      client,
      quoteId: getOptionalFormString(formData, "quote_id"),
      lineItems,
      dueAt: getOptionalFormString(formData, "due_at"),
    });
  } catch (error) {
    console.error("[dashboard/invoices] Invoice save failed:", error);
    return NextResponse.redirect(
      new URL("/dashboard/invoices?error=invoice-save", request.url),
      303,
    );
  }

  if (shouldSend) {
    if (!client.email) {
      return NextResponse.redirect(
        new URL("/dashboard/invoices?created=invoice&error=email-missing", request.url),
        303,
      );
    }

    const total = getLineItemsTotal(lineItems);
    const emailMessage =
      getOptionalFormString(formData, "email_message") ||
      `Hi ${client.name},\n\nYour Stornway invoice is ready. Total due: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}.\n\nPlease reply here with any questions.\n\nStornway Group`;

    try {
      await sendDashboardEmail({
        to: client.email,
        subject: `Stornway ${invoice.invoice_number}`,
        html: `
          <p>${escapeHtml(emailMessage).replaceAll("\n", "<br />")}</p>
          <hr />
          <p><strong>Invoice:</strong> ${escapeHtml(invoice.invoice_number)}</p>
          <p><strong>Total due:</strong> ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</p>
        `,
      });
      await updateInvoiceStatus(invoice.id, "sent");
    } catch (error) {
      console.error("[dashboard/invoices] Invoice email failed:", error);
      return NextResponse.redirect(
        new URL("/dashboard/invoices?created=invoice&error=email-send", request.url),
        303,
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      shouldSend
        ? "/dashboard/invoices?created=invoice&sent=email"
        : "/dashboard/invoices?created=invoice",
      request.url,
    ),
    303,
  );
}
