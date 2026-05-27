import Image from "next/image";
import { ArrowRight, LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/dashboard")
    ? params.next
    : "/dashboard";
  const hasError = params?.error === "1";

  return (
    <main className="dashboard-login-page">
      <div className="dashboard-login-media" aria-hidden="true">
        <Image
          src="/HQ.png"
          alt=""
          fill
          sizes="100vw"
          className="dashboard-login-image"
          priority
        />
        <div className="dashboard-login-shade" />
      </div>

      <section className="dashboard-login-panel" aria-labelledby="login-title">
        <div className="dashboard-login-mark">
          <LockKeyhole size={20} aria-hidden="true" />
        </div>
        <p className="dashboard-eyebrow">Stornway dashboard</p>
        <h1 id="login-title">Quote requests</h1>
        <p className="dashboard-login-copy">
          Enter the dashboard password to view client quote requests.
        </p>

        <form className="dashboard-login-form" action="/api/dashboard-login" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <label htmlFor="dashboard-password">Password</label>
          <input
            id="dashboard-password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={hasError}
            aria-describedby={hasError ? "dashboard-login-error" : undefined}
          />
          {hasError && (
            <p id="dashboard-login-error" className="dashboard-login-error">
              That password did not work. Please try again.
            </p>
          )}
          <button type="submit">
            <span>Unlock dashboard</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
