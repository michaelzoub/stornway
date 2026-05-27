import { randomUUID } from "node:crypto";
import {
  normalizeContactServices,
  type ContactServiceId,
} from "@/lib/contact-services";

export interface QuoteRequestInput {
  name: string;
  email: string;
  phone: string;
  services: ContactServiceId[];
  message: string;
  language: string;
}

export interface QuoteRequest extends QuoteRequestInput {
  id: string;
  created_at: string;
  email_sent: boolean;
}

export interface QuoteRequestUpdateInput {
  name: string;
  email: string;
  phone: string;
  services: ContactServiceId[];
  message: string;
  language: string;
  email_sent: boolean;
}

const TABLE_NAME = process.env.SUPABASE_QUOTE_REQUESTS_TABLE?.trim() || "quote_requests";
const SUPABASE_USER_AGENT = "StornwayServer/1.0";

export class QuoteRequestsError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "QuoteRequestsError";
  }
}

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

function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new QuoteRequestsError(
      "Supabase quote request database is not configured.",
      503,
    );
  }

  if (config.key.startsWith("sb_publishable_")) {
    throw new QuoteRequestsError(
      "Supabase quote requests require a backend secret/service role key.",
      503,
    );
  }

  return config;
}

function sortByNewest(requests: QuoteRequest[]): QuoteRequest[] {
  return [...requests].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function getSupabaseHeaders(key: string): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "User-Agent": SUPABASE_USER_AGENT,
  };
}

async function createSupabaseQuoteRequest(
  input: QuoteRequestInput,
): Promise<QuoteRequest> {
  const config = requireSupabaseConfig();

  const request: QuoteRequest = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    email_sent: false,
    ...input,
  };

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/rest/v1/${TABLE_NAME}`, {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(config.key),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error("[quote-requests] Supabase insert error:", error);
    throw new QuoteRequestsError(
      "Supabase quote request insert failed.",
      502,
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("[quote-requests] Supabase insert failed:", {
      status: response.status,
      detail,
    });
    throw new QuoteRequestsError(
      "Supabase quote request insert failed.",
      response.status,
    );
  }

  const [created] = (await response.json()) as QuoteRequest[];
  return created ?? request;
}

async function getSupabaseQuoteRequests(): Promise<QuoteRequest[]> {
  const config = requireSupabaseConfig();

  let response: Response;
  try {
    response = await fetch(
      `${config.baseUrl}/rest/v1/${TABLE_NAME}?select=*&order=created_at.desc`,
      {
        headers: getSupabaseHeaders(config.key),
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("[quote-requests] Supabase fetch error:", error);
    throw new QuoteRequestsError("Supabase quote request fetch failed.", 502);
  }

  if (!response.ok) {
    console.error("[quote-requests] Supabase fetch failed:", response.status);
    throw new QuoteRequestsError(
      "Supabase quote request fetch failed.",
      response.status,
    );
  }

  return (await response.json()) as QuoteRequest[];
}

async function markSupabaseEmailSent(id: string): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) return false;

  try {
    const response = await fetch(
      `${config.baseUrl}/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          ...getSupabaseHeaders(config.key),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_sent: true }),
      },
    );

    return response.ok;
  } catch (error) {
    console.warn("[quote-requests] Supabase update error:", error);
    return false;
  }
}

async function updateSupabaseQuoteRequest(
  id: string,
  input: QuoteRequestUpdateInput,
): Promise<QuoteRequest> {
  const config = requireSupabaseConfig();

  let response: Response;
  try {
    response = await fetch(
      `${config.baseUrl}/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          ...getSupabaseHeaders(config.key),
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(input),
      },
    );
  } catch (error) {
    console.error("[quote-requests] Supabase update error:", error);
    throw new QuoteRequestsError("Supabase quote request update failed.", 502);
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("[quote-requests] Supabase update failed:", {
      status: response.status,
      detail,
    });
    throw new QuoteRequestsError(
      "Supabase quote request update failed.",
      response.status,
    );
  }

  const [updated] = (await response.json()) as QuoteRequest[];
  if (!updated) {
    throw new QuoteRequestsError("Quote request was not found.", 404);
  }

  return updated;
}

async function deleteSupabaseQuoteRequest(id: string): Promise<void> {
  const config = requireSupabaseConfig();

  let response: Response;
  try {
    response = await fetch(
      `${config.baseUrl}/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          ...getSupabaseHeaders(config.key),
          Prefer: "return=minimal",
        },
      },
    );
  } catch (error) {
    console.error("[quote-requests] Supabase delete error:", error);
    throw new QuoteRequestsError("Supabase quote request delete failed.", 502);
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("[quote-requests] Supabase delete failed:", {
      status: response.status,
      detail,
    });
    throw new QuoteRequestsError(
      "Supabase quote request delete failed.",
      response.status,
    );
  }
}

function getRequiredFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getQuoteRequestUpdateFromForm(
  formData: FormData,
): QuoteRequestUpdateInput {
  return {
    name: getRequiredFormString(formData, "name"),
    email: getRequiredFormString(formData, "email"),
    phone: getRequiredFormString(formData, "phone"),
    services: normalizeContactServices(formData.getAll("services")),
    message: getRequiredFormString(formData, "message"),
    language: getRequiredFormString(formData, "language") === "fr" ? "fr" : "en",
    email_sent: formData.get("email_sent") === "on",
  };
}

export async function createQuoteRequest(
  input: QuoteRequestInput,
): Promise<QuoteRequest> {
  return createSupabaseQuoteRequest(input);
}

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  return sortByNewest(await getSupabaseQuoteRequests());
}

export async function markQuoteRequestEmailSent(id: string) {
  await markSupabaseEmailSent(id);
}

export async function updateQuoteRequest(
  id: string,
  input: QuoteRequestUpdateInput,
) {
  await updateSupabaseQuoteRequest(id, input);
}

export async function deleteQuoteRequest(id: string) {
  await deleteSupabaseQuoteRequest(id);
}
