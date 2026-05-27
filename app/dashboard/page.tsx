import { LogOut, Mail, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import {
  getQuoteRequests,
  type QuoteRequest,
} from "@/lib/quote-requests";
import type { ContactServiceId } from "@/lib/contact-services";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure washing",
  "window-washing": "Window washing",
  general: "General inquiry",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatServices(request: QuoteRequest): string {
  if (request.services.length === 0) return "Not specified";
  return request.services.map((service) => SERVICE_LABELS[service]).join(", ");
}

function countRecentRequests(requests: QuoteRequest[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return requests.filter(
    (request) => new Date(request.created_at).getTime() >= sevenDaysAgo,
  ).length;
}

function getTopService(requests: QuoteRequest[]): string {
  const counts = new Map<ContactServiceId, number>();

  for (const request of requests) {
    for (const service of request.services) {
      counts.set(service, (counts.get(service) ?? 0) + 1);
    }
  }

  const [topService] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  return topService ? SERVICE_LABELS[topService] : "Not enough data";
}

export default async function DashboardPage() {
  let requests: QuoteRequest[] = [];
  let loadError: string | null = null;

  try {
    requests = await getQuoteRequests();
  } catch (error) {
    console.error("[dashboard] Failed to load quote requests:", error);
    loadError = "Quote requests could not be loaded from Supabase.";
  }

  const recentRequests = countRecentRequests(requests);
  const topService = getTopService(requests);

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Stornway dashboard</p>
            <h1>Quote requests</h1>
          </div>
          <div className="dashboard-actions">
            <a className="dashboard-refresh" href="/dashboard" aria-label="Refresh requests">
              <RefreshCw size={18} aria-hidden="true" />
              <span>Refresh</span>
            </a>
            <form action="/api/dashboard-logout" method="post">
              <button className="dashboard-logout" type="submit" aria-label="Log out">
                <LogOut size={18} aria-hidden="true" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </header>

        <div className="dashboard-stats" aria-label="Quote request summary">
          <article className="dashboard-stat">
            <span>Total requests</span>
            <strong>{requests.length}</strong>
          </article>
          <article className="dashboard-stat">
            <span>Last 7 days</span>
            <strong>{recentRequests}</strong>
          </article>
          <article className="dashboard-stat">
            <span>Top service</span>
            <strong>{topService}</strong>
          </article>
          <article className="dashboard-stat">
            <span>Email notices</span>
            <strong>
              {requests.filter((request) => request.email_sent).length}/
              {requests.length}
            </strong>
          </article>
        </div>

        <section className="dashboard-panel" aria-labelledby="requests-title">
          <div className="dashboard-panel-header">
            <h2 id="requests-title">Clients</h2>
            <p>
              <ShieldCheck size={16} aria-hidden="true" />
              {process.env.DASHBOARD_PASSWORD
                ? "Protected"
                : "Local access"}
            </p>
          </div>

          {loadError ? (
            <div className="dashboard-empty">{loadError}</div>
          ) : requests.length === 0 ? (
            <div className="dashboard-empty">
              No quote requests have been submitted yet.
            </div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Service</th>
                    <th>Message</th>
                    <th>Submitted</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.name}</strong>
                        <span>{request.language.toUpperCase()}</span>
                      </td>
                      <td>
                        <a href={`mailto:${request.email}`}>
                          <Mail size={14} aria-hidden="true" />
                          {request.email}
                        </a>
                        {request.phone && (
                          <a href={`tel:${request.phone}`}>
                            <Phone size={14} aria-hidden="true" />
                            {request.phone}
                          </a>
                        )}
                      </td>
                      <td>{formatServices(request)}</td>
                      <td className="dashboard-message">{request.message}</td>
                      <td>{formatDate(request.created_at)}</td>
                      <td>
                        <span
                          className={
                            request.email_sent
                              ? "dashboard-pill is-sent"
                              : "dashboard-pill"
                          }
                        >
                          {request.email_sent ? "Sent" : "Saved"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
