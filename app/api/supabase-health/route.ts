import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getSupabaseRuntimeConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  const table = process.env.SUPABASE_QUOTE_REQUESTS_TABLE?.trim() || "quote_requests";

  return {
    url: url.replace(/\/$/, ""),
    serviceKey,
    anonKey,
    table,
  };
}

export async function GET() {
  const config = getSupabaseRuntimeConfig();

  const status = {
    hasUrl: Boolean(config.url),
    hasServiceRoleKey: Boolean(config.serviceKey),
    hasAnonKey: Boolean(config.anonKey),
    serviceKeyKind: config.serviceKey.startsWith("sb_publishable_")
      ? "publishable"
      : config.serviceKey.startsWith("sb_secret_")
        ? "secret"
        : config.serviceKey.startsWith("eyJ")
          ? "jwt-looking"
          : config.serviceKey
            ? "other"
            : "missing",
    quoteRequestsTable: config.table,
    restStatus: null as number | null,
    restOk: false,
    restMessage: "",
    tables: {} as Record<
      string,
      { status: number | null; ok: boolean; message: string }
    >,
  };

  if (!config.url || !config.serviceKey) {
    return NextResponse.json(status);
  }

  try {
    const tableNames = [
      config.table,
      "clients",
      "jobs",
      "quotes",
      "quote_line_items",
      "invoices",
      "invoice_line_items",
    ];

    const results = await Promise.all(
      tableNames.map(async (table) => {
        const response = await fetch(
          `${config.url}/rest/v1/${encodeURIComponent(table)}?select=id&limit=1`,
          {
            headers: {
              apikey: config.serviceKey,
              Authorization: `Bearer ${config.serviceKey}`,
            },
            cache: "no-store",
          },
        );

        return {
          table,
          status: response.status,
          ok: response.ok,
          message: response.ok
            ? "Reachable."
            : (await response.text()).slice(0, 300),
        };
      }),
    );

    for (const result of results) {
      status.tables[result.table] = {
        status: result.status,
        ok: result.ok,
        message: result.message,
      };
    }

    const response = await fetch(
      `${config.url}/rest/v1/${encodeURIComponent(config.table)}?select=id&limit=1`,
      {
        headers: {
          apikey: config.serviceKey,
          Authorization: `Bearer ${config.serviceKey}`,
        },
        cache: "no-store",
      },
    );

    status.restStatus = response.status;
    status.restOk = response.ok;
    status.restMessage = response.ok
      ? "Supabase table is reachable from Next.js."
      : (await response.text()).slice(0, 500);
  } catch (error) {
    status.restMessage =
      error instanceof Error ? error.message : "Unknown Supabase fetch error.";
  }

  return NextResponse.json(status);
}
