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

type JobInput = {
  client: ClientInput;
  serviceType: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
};

const USER_AGENT = "StornwayDashboardWrite/1.0";

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

export async function sendDashboardEmail(input: {
  to: string;
  subject: string;
  html: string;
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
