import { revalidatePath } from "next/cache";
import {
  LogOut,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  deleteQuoteRequest,
  getQuoteRequestUpdateFromForm,
  getQuoteRequests,
  type QuoteRequest,
  updateQuoteRequest,
} from "@/lib/quote-requests";
import type { ContactServiceId } from "@/lib/contact-services";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure washing",
  "window-washing": "Window washing",
  general: "General inquiry",
};

const SERVICE_OPTIONS = Object.entries(SERVICE_LABELS) as [
  ContactServiceId,
  string,
][];

async function updateDashboardQuoteRequest(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await updateQuoteRequest(id, getQuoteRequestUpdateFromForm(formData));
  revalidatePath("/dashboard");
}

async function deleteDashboardQuoteRequest(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await deleteQuoteRequest(id);
  revalidatePath("/dashboard");
}

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
                    <th>Actions</th>
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
                      <td>
                        <div className="dashboard-row-actions">
                          <details className="dashboard-edit">
                            <summary>
                              <Pencil size={15} aria-hidden="true" />
                              <span>Edit</span>
                            </summary>
                            <form
                              className="dashboard-edit-form"
                              action={updateDashboardQuoteRequest}
                            >
                              <input type="hidden" name="id" value={request.id} />

                              <label>
                                <span>Name</span>
                                <input
                                  name="name"
                                  defaultValue={request.name}
                                  required
                                />
                              </label>

                              <label>
                                <span>Email</span>
                                <input
                                  name="email"
                                  type="email"
                                  defaultValue={request.email}
                                  required
                                />
                              </label>

                              <label>
                                <span>Phone</span>
                                <input name="phone" defaultValue={request.phone} />
                              </label>

                              <label>
                                <span>Language</span>
                                <select name="language" defaultValue={request.language}>
                                  <option value="en">English</option>
                                  <option value="fr">French</option>
                                </select>
                              </label>

                              <fieldset>
                                <legend>Services</legend>
                                {SERVICE_OPTIONS.map(([service, label]) => (
                                  <label key={service}>
                                    <input
                                      type="checkbox"
                                      name="services"
                                      value={service}
                                      defaultChecked={request.services.includes(
                                        service,
                                      )}
                                    />
                                    <span>{label}</span>
                                  </label>
                                ))}
                              </fieldset>

                              <label className="dashboard-edit-message">
                                <span>Message</span>
                                <textarea
                                  name="message"
                                  defaultValue={request.message}
                                  required
                                  rows={4}
                                />
                              </label>

                              <label className="dashboard-edit-check">
                                <input
                                  type="checkbox"
                                  name="email_sent"
                                  defaultChecked={request.email_sent}
                                />
                                <span>Email notice sent</span>
                              </label>

                              <button className="dashboard-save" type="submit">
                                <Save size={15} aria-hidden="true" />
                                <span>Save</span>
                              </button>
                            </form>
                          </details>

                          <details className="dashboard-delete-confirm">
                            <summary>
                              <Trash2 size={15} aria-hidden="true" />
                              <span>Delete</span>
                            </summary>
                            <form action={deleteDashboardQuoteRequest}>
                              <input type="hidden" name="id" value={request.id} />
                              <button
                                className="dashboard-delete"
                                type="submit"
                                aria-label={`Confirm deleting quote request from ${request.name}`}
                              >
                                Confirm delete
                              </button>
                            </form>
                          </details>
                        </div>
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
