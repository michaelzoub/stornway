import { randomUUID } from "node:crypto";
import { Resend } from "resend";

type ClientInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type LineItemInput = {
  productService: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type SupabaseClient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type DashboardDocument = {
  number: string;
  documentType: "Quote" | "Invoice";
  client: ClientInput;
  lineItems: LineItemInput[];
  total: number;
  issuedAt?: string | null;
  dueAt?: string | null;
};

type JobInput = {
  client: ClientInput;
  serviceType: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
};

const USER_AGENT = "StornwayDashboardWrite/1.0";
const moneyWithCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase dashboard write credentials are not configured.");
  }

  return {
    baseUrl: url.replace(/\/$/, ""),
    key,
  };
}

function getHeaders(key: string): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "User-Agent": USER_AGENT,
  };
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(formData: FormData, key: string) {
  return requiredString(formData, key) || "";
}

function numberFromForm(formData: FormData, key: string, fallback = 0) {
  const value = Number(requiredString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export function getLineItemFromForm(formData: FormData): LineItemInput {
  return {
    productService: requiredString(formData, "product_service"),
    description: optionalString(formData, "description"),
    quantity: numberFromForm(formData, "quantity", 1) || 1,
    unitPrice: numberFromForm(formData, "unit_price"),
  };
}

function formValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

export function getLineItemsFromForm(formData: FormData): LineItemInput[] {
  const products = formValues(formData, "product_service");
  const descriptions = formValues(formData, "description");
  const quantities = formValues(formData, "quantity");
  const unitPrices = formValues(formData, "unit_price");
  const rowCount = Math.max(
    products.length,
    descriptions.length,
    quantities.length,
    unitPrices.length,
  );
  const lineItems = Array.from({ length: rowCount }, (_, index) => ({
    productService: products[index] || "",
    description: descriptions[index] || "",
    quantity: Number(quantities[index]) || 1,
    unitPrice: Number(unitPrices[index]) || 0,
  })).filter((item) => item.productService && item.unitPrice > 0);

  return lineItems.length ? lineItems : [getLineItemFromForm(formData)];
}

export function getClientFromForm(formData: FormData): ClientInput {
  return {
    name: requiredString(formData, "client_name"),
    email: optionalString(formData, "client_email"),
    phone: optionalString(formData, "client_phone"),
    address: optionalString(formData, "client_address"),
  };
}

export function getTotal(lineItem: LineItemInput) {
  return lineItem.quantity * lineItem.unitPrice;
}

export function getLineItemsTotal(lineItems: LineItemInput[]) {
  return lineItems.reduce((total, item) => total + getTotal(item), 0);
}

function formatDocumentDate(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function splitAddress(address: string) {
  const normalized = address.trim() || "Address to confirm, Montreal, QC";
  const [street, ...rest] = normalized.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    street: street || "Address to confirm",
    cityLine: rest.join(", ") || "Montreal, QC",
  };
}

export function renderDashboardDocumentEmail(input: {
  document: DashboardDocument;
  message?: string;
}) {
  const { document, message } = input;
  const { street, cityLine } = splitAddress(document.client.address);
  const sentLabel = document.documentType === "Invoice" ? "Issued on:" : "Sent on:";
  const totalLabel = document.documentType === "Invoice" ? "Total Due" : "Total Estimate";
  const footer =
    document.documentType === "Invoice"
      ? "Payment is due by the date shown above. Please contact Stornway Group with any questions."
      : "This quote is valid for the next 30 days, after which values may be subject to change.";
  const heading = `${document.documentType.toUpperCase()} ${escapeHtml(document.number)}`;
  const intro = message
    ? `<div style="margin:0 0 24px;color:#27272a;font:16px/1.45 Arial,sans-serif;">${escapeHtml(message).replaceAll("\n", "<br />")}</div>`
    : "";

  const lineRows = document.lineItems
    .map((item) => {
      const total = item.quantity * item.unitPrice;
      return `
        <tr>
          <td style="padding:12px 10px;border-bottom:1px solid #eeeeee;vertical-align:top;font-weight:600;">${escapeHtml(item.productService)}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eeeeee;vertical-align:top;">${escapeHtml(item.description || "Exterior service")}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eeeeee;text-align:center;vertical-align:top;">${item.quantity}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eeeeee;vertical-align:top;">${moneyWithCents.format(item.unitPrice)}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #eeeeee;vertical-align:top;font-weight:700;">${moneyWithCents.format(total)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="background:#f4f4f0;padding:24px;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;color:#27272a;padding:42px 44px;font-family:Arial,sans-serif;">
        ${intro}
        <div style="display:grid;grid-template-columns:170px 1fr;gap:48px;align-items:start;">
          <div style="width:130px;height:130px;background:#071b06;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;line-height:1.05;text-align:center;">
            STORNWAY<br />GROUP
          </div>
          <div>
            <h1 style="margin:0;color:#2a2a2a;font-size:34px;line-height:1.1;font-weight:900;letter-spacing:0;text-transform:uppercase;">${heading}</h1>
            <div style="margin-top:10px;border-top:2px solid #556052;padding-top:14px;">
              <p style="margin:0;color:#2a2a2a;font-size:13px;font-weight:900;text-transform:uppercase;">${sentLabel}</p>
              <p style="margin:18px 0 0;border-bottom:1px solid #d6d3d1;padding-bottom:10px;color:#78716c;font-size:17px;font-weight:700;">${formatDocumentDate(document.issuedAt)}</p>
            </div>
          </div>
        </div>

        <div style="margin:30px 0;border-top:1px solid #d6d3d1;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:54px;">
          <div>
            <p style="margin:0;color:#57534e;font-size:13px;font-weight:900;text-transform:uppercase;">Recipient:</p>
            <p style="margin:10px 0 8px;font-size:22px;font-weight:900;">${escapeHtml(document.client.name)}</p>
            <p style="margin:0;font-size:16px;line-height:1.22;">
              ${escapeHtml(street)}<br />
              ${escapeHtml(cityLine)}<br />
              Phone: ${escapeHtml(document.client.phone || "Phone to confirm")}
            </p>
          </div>
          <div>
            <p style="margin:0;color:#57534e;font-size:13px;font-weight:900;text-transform:uppercase;">Sender:</p>
            <p style="margin:10px 0 8px;font-size:22px;font-weight:900;">Stornway Group</p>
            <p style="margin:0;font-size:16px;line-height:1.22;">
              Residential and commercial exterior services<br />
              Phone: 514-758-6241<br />
              Email: info@stornway.com<br />
              Website: stornway.com
            </p>
          </div>
        </div>

        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;margin-top:42px;border-collapse:collapse;font-size:14px;text-align:left;">
          <thead>
            <tr style="background:#071b06;color:#ffffff;">
              <th style="padding:10px;font-weight:900;">Product/Service</th>
              <th style="padding:10px;border-left:1px solid rgba(255,255,255,0.25);font-weight:900;">Description</th>
              <th style="padding:10px;border-left:1px solid rgba(255,255,255,0.25);font-weight:900;text-align:center;">Qty.</th>
              <th style="padding:10px;border-left:1px solid rgba(255,255,255,0.25);font-weight:900;">Unit Price</th>
              <th style="padding:10px;border-left:1px solid rgba(255,255,255,0.25);font-weight:900;">Total</th>
            </tr>
          </thead>
          <tbody>${lineRows}</tbody>
        </table>

        <p style="margin:14px 0 0;font-size:14px;">* Non-taxable</p>

        <div style="margin-top:36px;text-align:right;">
          <span style="font-size:17px;font-weight:900;">${totalLabel}</span>
          <span style="display:inline-block;margin-left:16px;min-width:120px;border:1px solid #d6d3d1;padding:10px 14px;font-size:17px;font-weight:800;text-align:right;">${moneyWithCents.format(document.total)}</span>
        </div>

        <p style="margin:90px 0 0;font-size:16px;line-height:1.35;">${footer}</p>
      </div>
    </div>
  `;
}

export function getDashboardDocumentAttachment(document: DashboardDocument) {
  const safeNumber = document.number.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "");

  return {
    filename: `${document.documentType.toLowerCase()}-${safeNumber || "stornway"}.html`,
    content: renderDashboardDocumentEmail({ document }),
    contentType: "text/html",
  };
}

export function getOptionalFormString(formData: FormData, key: string) {
  return optionalString(formData, key);
}

export async function readDashboardFormData(request: Request) {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

export function makeQuoteNumber() {
  return `Q-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

export function makeInvoiceNumber() {
  return `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  return fetch(`${config.baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...getHeaders(config.key),
      ...init.headers,
    },
  });
}

async function fetchExistingClient(client: ClientInput) {
  const filters = [];
  if (client.email) filters.push(`email.eq.${encodeURIComponent(client.email)}`);
  if (client.phone) filters.push(`phone.eq.${encodeURIComponent(client.phone)}`);

  if (filters.length === 0) return null;

  const response = await supabaseFetch(
    `clients?select=*&or=(${filters.join(",")})&limit=1`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;
  const [existing] = (await response.json()) as SupabaseClient[];
  return existing ?? null;
}

export async function ensureClient(client: ClientInput) {
  const existing = await fetchExistingClient(client);
  if (existing) return existing;

  const response = await supabaseFetch("clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: client.name,
      email: client.email || null,
      phone: client.phone || null,
      address: client.address || null,
      status: "lead",
      source: "dashboard",
    }),
  });

  if (!response.ok) {
    throw new Error(`Client create failed: ${await response.text()}`);
  }

  const [created] = (await response.json()) as SupabaseClient[];
  return created;
}

export async function createQuote(input: {
  client: ClientInput;
  quoteRequestId?: string;
  serviceType: string;
  lineItems: LineItemInput[];
  status?: string;
}) {
  const client = await ensureClient(input.client);
  const total = getLineItemsTotal(input.lineItems);
  const firstLineItem = input.lineItems[0];

  const quoteResponse = await supabaseFetch("quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      quote_number: makeQuoteNumber(),
      client_id: client.id,
      quote_request_id: input.quoteRequestId || null,
      status: input.status ?? "draft",
      service_type: input.serviceType || firstLineItem.productService,
      subtotal: total,
      total,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    }),
  });

  if (!quoteResponse.ok) {
    throw new Error(`Quote create failed: ${await quoteResponse.text()}`);
  }

  const [quote] = (await quoteResponse.json()) as { id: string; quote_number: string }[];

  const lineResponse = await supabaseFetch("quote_line_items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      input.lineItems.map((item, index) => ({
        quote_id: quote.id,
        product_service: item.productService,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        sort_order: index,
      })),
    ),
  });

  if (!lineResponse.ok) {
    throw new Error(`Quote line item create failed: ${await lineResponse.text()}`);
  }

  return { ...quote, client, total };
}

export async function createInvoice(input: {
  client: ClientInput;
  quoteId?: string;
  lineItems: LineItemInput[];
  dueAt?: string;
  status?: "draft" | "sent";
}) {
  const client = await ensureClient(input.client);
  const total = getLineItemsTotal(input.lineItems);

  const invoiceResponse = await supabaseFetch("invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      invoice_number: makeInvoiceNumber(),
      quote_id: input.quoteId || null,
      client_id: client.id,
      status: input.status ?? "draft",
      due_at: input.dueAt || null,
      subtotal: total,
      total,
    }),
  });

  if (!invoiceResponse.ok) {
    throw new Error(`Invoice create failed: ${await invoiceResponse.text()}`);
  }

  const [invoice] = (await invoiceResponse.json()) as { id: string; invoice_number: string }[];

  const lineResponse = await supabaseFetch("invoice_line_items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      input.lineItems.map((item, index) => ({
        invoice_id: invoice.id,
        product_service: item.productService,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        sort_order: index,
      })),
    ),
  });

  if (!lineResponse.ok) {
    throw new Error(`Invoice line item create failed: ${await lineResponse.text()}`);
  }

  return { ...invoice, client, total };
}

export async function updateInvoiceStatus(id: string, status: "draft" | "sent") {
  const response = await supabaseFetch(`invoices?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Invoice status update failed: ${await response.text()}`);
  }
}

export async function updateQuoteStatusByNumber(quoteNumber: string, status: "draft" | "sent") {
  const response = await supabaseFetch(
    `quotes?quote_number=eq.${encodeURIComponent(quoteNumber)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Quote status update failed: ${await response.text()}`);
  }
}

export async function updateInvoiceStatusByNumber(
  invoiceNumber: string,
  status: "draft" | "sent",
) {
  const response = await supabaseFetch(
    `invoices?invoice_number=eq.${encodeURIComponent(invoiceNumber)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(`Invoice status update failed: ${await response.text()}`);
  }
}

type SupabaseDocumentRow = {
  quote_number?: string | null;
  invoice_number?: string | null;
  total?: number | string | null;
  subtotal?: number | string | null;
  created_at?: string | null;
  issued_at?: string | null;
  due_at?: string | null;
  clients?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  quote_line_items?: Array<{
    product_service?: string | null;
    description?: string | null;
    quantity?: number | string | null;
    unit_price?: number | string | null;
  }> | null;
  invoice_line_items?: Array<{
    product_service?: string | null;
    description?: string | null;
    quantity?: number | string | null;
    unit_price?: number | string | null;
  }> | null;
};

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function mapDocumentLineItems(
  items:
    | SupabaseDocumentRow["quote_line_items"]
    | SupabaseDocumentRow["invoice_line_items"],
  fallbackTotal: number,
): LineItemInput[] {
  const mapped = (items ?? [])
    .map((item) => ({
      productService: item.product_service || "Exterior service",
      description: item.description || "Exterior cleaning service.",
      quantity: toNumber(item.quantity) || 1,
      unitPrice: toNumber(item.unit_price),
    }))
    .filter((item) => item.productService && item.unitPrice > 0);

  if (mapped.length > 0) return mapped;

  return [
    {
      productService: "Exterior service",
      description: "Exterior cleaning service.",
      quantity: 1,
      unitPrice: fallbackTotal,
    },
  ];
}

function mapDocumentRow(
  row: SupabaseDocumentRow,
  documentType: "Quote" | "Invoice",
): DashboardDocument {
  const total = toNumber(row.total || row.subtotal);
  const lineItems = mapDocumentLineItems(
    documentType === "Invoice" ? row.invoice_line_items : row.quote_line_items,
    total,
  );

  return {
    number:
      (documentType === "Invoice" ? row.invoice_number : row.quote_number) ||
      "Draft",
    documentType,
    client: {
      name: row.clients?.name || "Client to confirm",
      email: row.clients?.email || "",
      phone: row.clients?.phone || "",
      address: row.clients?.address || "Address to confirm, Montreal, QC",
    },
    lineItems,
    total: total || getLineItemsTotal(lineItems),
    issuedAt: row.issued_at || row.created_at,
    dueAt: row.due_at,
  };
}

export async function getQuoteDocumentByNumber(
  quoteNumber: string,
): Promise<DashboardDocument | null> {
  const response = await supabaseFetch(
    `quotes?quote_number=eq.${encodeURIComponent(quoteNumber)}&select=*,clients(*),quote_line_items(*)&limit=1`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Quote document fetch failed: ${await response.text()}`);
  }

  const [row] = (await response.json()) as SupabaseDocumentRow[];
  return row ? mapDocumentRow(row, "Quote") : null;
}

export async function getInvoiceDocumentByNumber(
  invoiceNumber: string,
): Promise<DashboardDocument | null> {
  const response = await supabaseFetch(
    `invoices?invoice_number=eq.${encodeURIComponent(invoiceNumber)}&select=*,clients(*),invoice_line_items(*)&limit=1`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Invoice document fetch failed: ${await response.text()}`);
  }

  const [row] = (await response.json()) as SupabaseDocumentRow[];
  return row ? mapDocumentRow(row, "Invoice") : null;
}

export function getJobFromForm(formData: FormData): JobInput {
  return {
    client: getClientFromForm(formData),
    serviceType: requiredString(formData, "service_type"),
    scheduledStart: requiredString(formData, "scheduled_start"),
    scheduledEnd: optionalString(formData, "scheduled_end"),
    notes: optionalString(formData, "notes"),
  };
}

export async function createJob(input: JobInput) {
  await ensureClient(input.client);
  const response = await supabaseFetch("jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      client_name: input.client.name,
      client_email: input.client.email || null,
      client_phone: input.client.phone || null,
      address: input.client.address || null,
      job_type: input.serviceType || "general",
      status: "scheduled",
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd || null,
      notes: input.notes || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Job create failed: ${await response.text()}`);
  }

  const [job] = (await response.json()) as { id: string }[];
  return job;
}

export async function updateJobStatus(id: string, status: "scheduled" | "in_progress" | "completed") {
  const response = await supabaseFetch(`jobs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      completed_date: status === "completed" ? new Date().toISOString() : null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Job status update failed: ${await response.text()}`);
  }
}

export async function sendDashboardEmail(input: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const resend = new Resend(apiKey);
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Stornway Group <onboarding@resend.dev>";

  const payload = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  };
  const { error } = await resend.emails.send(payload);

  if (
    error?.message.toLowerCase().includes("domain is not verified") &&
    !from.includes("onboarding@resend.dev")
  ) {
    const retry = await resend.emails.send({
      ...payload,
      from: "Stornway Group <onboarding@resend.dev>",
    });
    if (retry.error) throw new Error(retry.error.message);
    return;
  }

  if (error) throw new Error(error.message);
}
