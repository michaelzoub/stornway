import type { ContactServiceId } from "@/lib/contact-services";
import { getQuoteRequests, type QuoteRequest } from "@/lib/quote-requests";

export type DashboardCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  service: string;
  lastService: string;
  lifetime: number;
  status: string;
  type: string;
};

export type DashboardJob = {
  client: string;
  service: string;
  address: string;
  date: string;
  time: string;
  crew: string;
  status: string;
  revenue: number;
};

export type DashboardQuoteLineItem = {
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type DashboardQuote = {
  client: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  service: string;
  value: number;
  created: string;
  status: string;
  lineItems: DashboardQuoteLineItem[];
};

export type DashboardInvoice = {
  number: string;
  client: string;
  email: string;
  phone: string;
  due: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
};

type SupabaseClientRow = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  status?: string | null;
  client_type?: string | null;
  created_at?: string | null;
};

type SupabaseJobRow = {
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  job_type?: string | null;
  status?: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  completed_date?: string | null;
  created_at?: string | null;
  revenue?: number | string | null;
};

type SupabaseQuoteRow = {
  quote_number?: string | null;
  status?: string | null;
  service_type?: string | null;
  total?: number | string | null;
  subtotal?: number | string | null;
  created_at?: string | null;
  clients?: SupabaseClientRow | null;
  quote_line_items?: Array<{
    product_service?: string | null;
    description?: string | null;
    quantity?: number | string | null;
    unit_price?: number | string | null;
  }> | null;
};

type SupabaseInvoiceRow = {
  invoice_number?: string | null;
  status?: string | null;
  issued_at?: string | null;
  due_at?: string | null;
  total?: number | string | null;
  amount_paid?: number | string | null;
  clients?: SupabaseClientRow | null;
  invoice_line_items?: Array<{
    product_service?: string | null;
    description?: string | null;
    quantity?: number | string | null;
    unit_price?: number | string | null;
  }> | null;
};

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure Washing",
  "window-washing": "Window Cleaning",
  general: "General Inquiry",
};

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) return null;

  return {
    baseUrl: url.replace(/\/$/, ""),
    key,
  };
}

function getHeaders(key: string): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "User-Agent": "StornwayDashboard/1.0",
  };
}

async function fetchSupabaseRows<T>(
  table: string,
  query = "select=*&order=created_at.desc",
): Promise<T[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  try {
    const response = await fetch(
      `${config.baseUrl}/rest/v1/${table}?${query}`,
      {
        headers: getHeaders(config.key),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.warn(`[dashboard-data] ${table} fetch failed:`, response.status);
      return [];
    }

    return (await response.json()) as T[];
  } catch (error) {
    console.warn(`[dashboard-data] ${table} fetch error:`, error);
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start) return "Time to confirm";

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const startLabel = formatter.format(new Date(start));
  return end ? `${startLabel} - ${formatter.format(new Date(end))}` : startLabel;
}

function toNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function titleCase(value?: string | null) {
  if (!value) return "Not set";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatServices(services: ContactServiceId[]) {
  if (services.length === 0) return "General Inquiry";
  return services.map((service) => SERVICE_LABELS[service]).join(", ");
}

function firstServiceType(services: ContactServiceId[]) {
  if (services.includes("landscaping")) return "Landscaping";
  if (services.includes("pressure-washing")) return "Pressure Washing";
  if (services.includes("window-washing")) return "Window Cleaning";
  return "General";
}

function customerFromQuoteRequest(request: QuoteRequest): DashboardCustomer {
  return {
    name: request.name,
    email: request.email,
    phone: request.phone,
    address: "Address to confirm",
    city: "To confirm",
    postal: "",
    service: formatServices(request.services),
    lastService: formatDate(request.created_at),
    lifetime: 0,
    status: request.email_sent ? "Contacted" : "Lead",
    type: firstServiceType(request.services),
  };
}

export async function getDashboardCustomers(): Promise<DashboardCustomer[]> {
  const clients = await fetchSupabaseRows<SupabaseClientRow>("clients");

  if (clients.length > 0) {
    return clients.map((client) => ({
      name: client.name || "Unnamed client",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "Address to confirm",
      city: client.city || "To confirm",
      postal: client.postal_code || "",
      service: "Account history",
      lastService: formatDate(client.created_at),
      lifetime: 0,
      status: titleCase(client.status),
      type: titleCase(client.client_type),
    }));
  }

  try {
    const requests = await getQuoteRequests();
    const unique = new Map<string, DashboardCustomer>();

    for (const request of requests) {
      const key = request.email.toLowerCase() || request.phone || request.name;
      if (!unique.has(key)) unique.set(key, customerFromQuoteRequest(request));
    }

    return [...unique.values()];
  } catch {
    return [];
  }
}

export async function getDashboardJobs(): Promise<DashboardJob[]> {
  const jobs = await fetchSupabaseRows<SupabaseJobRow>("jobs");

  return jobs.map((job) => ({
    client: job.client_name || job.client_email || "Client to confirm",
    service: titleCase(job.job_type),
    address: [job.address, job.city].filter(Boolean).join(", ") || "Address to confirm",
    date: formatDate(job.scheduled_start || job.completed_date || job.created_at),
    time: formatTimeRange(job.scheduled_start, job.scheduled_end),
    crew: "Unassigned",
    status: titleCase(job.status),
    revenue: toNumber(job.revenue),
  }));
}

export async function getDashboardQuotes(): Promise<DashboardQuote[]> {
  const quotes = await fetchSupabaseRows<SupabaseQuoteRow>(
    "quotes",
    "select=*,clients(*),quote_line_items(*)&order=created_at.desc",
  );

  return quotes.map((quote) => {
    const lineItems = (quote.quote_line_items ?? []).map((item) => ({
      product: item.product_service || titleCase(quote.service_type),
      description: item.description || "",
      quantity: toNumber(item.quantity) || 1,
      unitPrice: toNumber(item.unit_price),
    }));
    const value = toNumber(quote.total || quote.subtotal);

    return {
      client: quote.clients?.name || "Client to confirm",
      email: quote.clients?.email || "",
      phone: quote.clients?.phone || "",
      address: quote.clients?.address || "Address to confirm",
      number: quote.quote_number || "Draft",
      service: titleCase(quote.service_type),
      value,
      created: formatDate(quote.created_at),
      status: titleCase(quote.status),
      lineItems:
        lineItems.length > 0
          ? lineItems
          : [
              {
                product: titleCase(quote.service_type),
                description: "",
                quantity: 1,
                unitPrice: value,
              },
            ],
    };
  });
}

export async function getDashboardInvoices(): Promise<DashboardInvoice[]> {
  const invoices = await fetchSupabaseRows<SupabaseInvoiceRow>(
    "invoices",
    "select=*,clients(*),invoice_line_items(*)&order=created_at.desc",
  );

  return invoices.map((invoice) => {
    const amount = toNumber(invoice.total);
    const paid = toNumber(invoice.amount_paid);

    return {
      number: invoice.invoice_number || "Draft",
      client: invoice.clients?.name || "Client to confirm",
      email: invoice.clients?.email || "",
      phone: invoice.clients?.phone || "",
      due: formatDate(invoice.due_at || invoice.issued_at),
      amount,
      paid,
      balance: Math.max(amount - paid, 0),
      status: titleCase(invoice.status),
    };
  });
}
