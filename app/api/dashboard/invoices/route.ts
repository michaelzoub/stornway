import { NextResponse } from "next/server";
import {
  createInvoice,
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

  if (!client.name || !lineItem.productService || lineItem.unitPrice <= 0) {
    return NextResponse.redirect(
      new URL("/dashboard/invoices?error=invoice-fields", request.url),
      303,
    );
  }

  const invoice = await createInvoice({
    client,
    quoteId: getOptionalFormString(formData, "quote_id"),
    lineItem,
    dueAt: getOptionalFormString(formData, "due_at"),
  });

  if (formData.get("send_email") === "on" && client.email) {
    const total = getTotal(lineItem);
    await sendDashboardEmail({
      to: client.email,
      subject: `Stornway ${invoice.invoice_number}`,
      html: `
        <p>Hi ${escapeHtml(client.name)},</p>
        <p>Your Stornway invoice is ready. Total due: <strong>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}</strong>.</p>
        <p>${escapeHtml(lineItem.description || "Please reply here with any questions.")}</p>
        <p>Stornway Group</p>
      `,
    });
  }

  return NextResponse.redirect(
    new URL("/dashboard/invoices?created=invoice", request.url),
    303,
  );
}
