"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  DashboardCustomer,
  DashboardInvoice,
  DashboardJob,
  DashboardQuote,
  DashboardQuoteLineItem,
} from "@/lib/dashboard-data";
import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  Home,
  Inbox,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  Search,
  Send,
  TrendingUp,
  Trash2,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";

type Tone = "emerald" | "blue" | "amber" | "red" | "violet" | "stone" | "orange";
type DashboardRole = "ADMIN" | "SALESPERSON" | "TECHNICIAN";

type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: typeof BadgeDollarSign;
};

type QuoteLineItem = DashboardQuoteLineItem;
type Quote = DashboardQuote;
type EditableLineItem = {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
};
type ConversionCounts = {
  requests: number;
  quotes: number;
  jobs: number;
  invoices: number;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moneyWithCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const navItems: Array<{
  label: string;
  href: string;
  icon: typeof Home;
  roles: DashboardRole[];
}> = [
  { label: "Home", href: "/dashboard", icon: Home, roles: ["ADMIN"] },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays, roles: ["ADMIN"] },
  { label: "Clients", href: "/dashboard/clients", icon: Users, roles: ["ADMIN", "SALESPERSON"] },
  { label: "Requests", href: "/dashboard/requests", icon: Inbox, roles: ["ADMIN", "SALESPERSON"] },
  { label: "Quotes", href: "/dashboard/quotes", icon: FileText, roles: ["ADMIN", "SALESPERSON"] },
  { label: "Jobs", href: "/dashboard/jobs", icon: Wrench, roles: ["ADMIN", "TECHNICIAN"] },
  { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText, roles: ["ADMIN", "SALESPERSON"] },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3, roles: ["ADMIN"] },
];

export type DashboardRequest = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  service: string;
  address: string;
  date: string;
  source: string;
  status: string;
  value: number;
};

function toneClasses(tone: Tone) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    stone: "bg-stone-100 text-stone-700 ring-stone-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
  };

  return tones[tone];
}

function statusTone(status: string): Tone {
  if (["Overdue", "Lost", "Delayed"].includes(status)) return "red";
  if (["Pending", "Draft", "Contacted"].includes(status)) return "amber";
  if (["Accepted", "Won", "Paid", "Completed", "Recurring"].includes(status)) return "emerald";
  if (["Viewed", "In Progress"].includes(status)) return "blue";
  if (status === "Quote Sent") return "violet";
  return "stone";
}

function getLeadSourceSegments(requests: DashboardRequest[]) {
  const colors = ["#3080ff", "#009767", "#f99c00", "#7008e7", "#79716b"];
  const counts = new Map<string, number>();

  for (const request of requests) {
    counts.set(request.source, (counts.get(request.source) ?? 0) + 1);
  }

  return [...counts.entries()].map(([label, value], index) => ({
    label,
    value,
    color: colors[index % colors.length],
  }));
}

function PageShell({
  active,
  title,
  eyebrow,
  role = "ADMIN",
  children,
}: {
  active: string;
  title: string;
  eyebrow: string;
  role?: DashboardRole;
  children: ReactNode;
}) {
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const setFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (params.get("sent") === "email") {
      setNotice({ tone: "success", message: "Email sent successfully through Resend." });
      return;
    }
    if (params.get("created") === "invoice") {
      setNotice({ tone: "success", message: "Invoice saved successfully." });
      return;
    }
    if (params.get("created") === "quote") {
      setNotice({ tone: "success", message: "Quote saved successfully." });
      return;
    }
    if (params.get("created") === "job") {
      setNotice({ tone: "success", message: "Job created successfully." });
      return;
    }
    if (params.get("updated") === "job") {
      setNotice({ tone: "success", message: "Job marked complete." });
      return;
    }
    if (error) {
      const messages: Record<string, string> = {
        "email-send": "Email could not be sent. Check the Resend sender/domain settings.",
        "email-missing": "Email could not be sent because the client email is missing.",
        "invoice-save": "Invoice could not be saved. Check the client and line item fields.",
        "invoice-fields": "Invoice needs a client, product/service, and a positive price.",
        "quote-save": "Quote could not be saved. Check the client and line item fields.",
        "quote-fields": "Quote needs a client, product/service, and a positive price.",
        "job-save": "Job could not be created. Check the request and schedule fields.",
        "job-fields": "Job needs a client, service, and start time.",
        "job-status-save": "Job status could not be updated. Please try again.",
        "job-status-fields": "Job status could not be updated because the job id is missing.",
        "form-data": "The submitted form could not be read. Please try again.",
        "send-fields": "Email needs a recipient, subject, message, and document number.",
      };
      setNotice({ tone: "error", message: messages[error] ?? "That action could not be completed." });
      return;
    }
      setNotice(null);
    };

    setFromUrl();
    window.addEventListener("popstate", setFromUrl);
    return () => window.removeEventListener("popstate", setFromUrl);
  }, []);

  return (
    <main className="stornway-dashboard stornway-dashboard--crm min-h-screen overflow-x-hidden bg-[var(--fog)] text-stone-950 lg:pl-[260px]">
      <div className="min-h-screen min-w-0">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] overflow-y-auto border-r border-stone-200 bg-white/95 lg:flex lg:flex-col">
          <div className="border-b border-stone-200 px-5 py-4">
            <a href="/dashboard" className="flex items-center gap-3">
              <img src="/stornwaylogo1.svg" alt="Stornway Group" className="dashboard-sidebar-logo" />
            </a>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.filter((item) => item.roles.includes(role)).map((item) => {
              const Icon = item.icon;
              const isActive = item.label === active;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-10 items-center gap-3 rounded-none px-3 py-2 text-sm transition ${
                    isActive
                      ? "border-l-2 border-emerald-700 bg-emerald-50 text-emerald-950"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </a>
              );
            })}
          </nav>
          <div className="border-t border-stone-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{role.toLowerCase()}</p>
            <p className="mt-1 text-sm font-semibold text-stone-800">Stornway Group</p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
              <button className="rounded-none border border-stone-200 p-2 text-stone-600 lg:hidden" aria-label="Open menu">
                <LayoutDashboard size={18} aria-hidden="true" />
              </button>
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden="true" />
                <input
                  className="h-10 w-full rounded-none border border-stone-200 bg-white pl-10 pr-20 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Search clients, jobs, invoices..."
                />
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-none border border-stone-200 px-1.5 py-0.5 text-xs text-stone-400 sm:block">
                  / 
                </kbd>
              </div>
              <QuickActions role={role} />
            </div>
          </header>
          <div className="space-y-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">{eyebrow}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">{title}</h1>
                <p className="mt-2 text-sm text-stone-500">
                  Keep revenue, jobs, invoices, and follow-ups moving without losing the thread.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterButton label="This month" />
                <FilterButton label="All services" />
                <FilterButton label="All crews" />
              </div>
            </div>
            {notice ? (
              <div
                className={`flex items-start justify-between gap-3 rounded-none border px-4 py-3 text-sm font-semibold shadow-sm ${
                  notice.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <p>{notice.message}</p>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="text-xs font-semibold opacity-70 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickActions({ role }: { role: DashboardRole }) {
  const actions = [
    { label: "Create quote", href: "/dashboard/quotes#quote-delivery", roles: ["ADMIN", "SALESPERSON"] },
    { label: "Create invoice", href: "/dashboard/invoices", roles: ["ADMIN", "SALESPERSON"] },
    { label: "Schedule job", href: "/dashboard/schedule", roles: ["ADMIN"] },
    { label: "Add client", href: "/dashboard/clients", roles: ["ADMIN", "SALESPERSON"] },
  ].filter((action) => action.roles.includes(role));
  const canSeeRequests = role === "ADMIN" || role === "SALESPERSON";

  if (actions.length === 0 && !canSeeRequests) return null;

  return (
    <div className="hidden items-center gap-2 md:flex">
      {actions.slice(0, 2).map((action) => (
        <a
          key={action.label}
          href={action.href}
          className="inline-flex items-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          <Plus size={16} aria-hidden="true" />
          {action.label}
        </a>
      ))}
      {canSeeRequests ? (
        <a
          href="/dashboard/requests"
          className="inline-flex items-center gap-2 rounded-none border border-emerald-700 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          <Inbox size={16} aria-hidden="true" />
          Requests
        </a>
      ) : null}
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700">
      <Filter size={15} aria-hidden="true" />
      {label}
    </button>
  );
}

function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="min-w-0 rounded-none border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-stone-950">{item.value}</p>
                <p className="mt-1 text-xs text-stone-500">{item.detail}</p>
              </div>
              <span className={`rounded-none p-2.5 ring-1 ${toneClasses(item.tone)}`}>
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function Card({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-none border border-stone-200 bg-white shadow-sm">
      <div className="flex min-h-12 items-center justify-between border-b border-stone-100 px-4">
        <h2 className="text-sm font-semibold text-stone-950">{title}</h2>
        {action ? <button className="text-xs font-semibold text-emerald-800">{action}</button> : null}
      </div>
      {children}
    </section>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <span className={`rounded-none px-2 py-1 text-xs font-semibold ring-1 ${toneClasses(tone)}`}>
      {children}
    </span>
  );
}

function RevenueChart({ data = [] }: { data?: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  if (data.length === 0) {
    return (
      <div className="p-4 text-sm text-stone-500">
        No Supabase rows available for this chart yet.
      </div>
    );
  }

  const points = data
    .map((item, index) => `${index * 64 + 18},${130 - (item.value / max) * 100}`)
    .join(" ");

  return (
    <div className="p-4">
      <svg viewBox="0 0 380 150" className="h-48 w-full" role="img" aria-label="Monthly revenue chart">
        <polyline points={points} fill="none" stroke="#007956" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => (
          <g key={item.label}>
            <circle cx={index * 64 + 18} cy={130 - (item.value / max) * 100} r="5" fill="#007956" />
            <text x={index * 64 + 18} y="146" textAnchor="middle" fontSize="11" fill="#79716b">
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; tone?: Tone }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  if (data.length === 0) {
    return (
      <div className="p-4 text-sm text-stone-500">
        No Supabase rows available for this chart yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-stone-700">{item.label}</span>
            <span className="text-stone-500">{money.format(item.value)}</span>
          </div>
          <div className="mt-2 h-2 rounded-none bg-stone-100">
            <div className="h-2 rounded-none bg-emerald-700" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PieChart({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; value: number; color: string }[];
}) {
  let cursor = 0;
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  if (segments.length === 0 || total === 0) {
    return (
      <div className="p-4 text-sm text-stone-500">
        No Supabase rows available for this breakdown yet.
      </div>
    );
  }

  const gradient = segments
    .map((item) => {
      const start = cursor;
      cursor += (item.value / total) * 100;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div className="grid gap-4 p-4 md:grid-cols-[150px_1fr] md:items-center">
      <div className="mx-auto size-36 rounded-none" style={{ background: `conic-gradient(${gradient})` }} aria-label={title} />
      <div className="space-y-2">
        {segments.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-stone-600">
              <span className="size-3 rounded-none" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="font-semibold text-stone-950">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const rawFirst = steps[0]?.value ?? 0;
  const first = Math.max(rawFirst, 1);
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.label} className="rounded-none border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{step.label}</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{step.value}</p>
          <p className="mt-1 text-xs text-stone-500">
            {rawFirst === 0 ? "No source rows yet" : `${Math.round((step.value / first) * 100)}% of first step`}
          </p>
          {index < steps.length - 1 ? <div className="mt-3 h-1 rounded-none bg-emerald-700" /> : null}
        </div>
      ))}
    </div>
  );
}

function getAreaFromJob(job: DashboardJob) {
  const parts = job.address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts[1] || parts[0] || "Unassigned";
}

function heatColor(value: number, max: number) {
  if (max <= 0 || value <= 0) return "rgba(245, 245, 244, 1)";
  const intensity = value / max;
  if (intensity > 0.8) return "rgba(0, 82, 59, 0.92)";
  if (intensity > 0.6) return "rgba(0, 121, 86, 0.78)";
  if (intensity > 0.4) return "rgba(77, 154, 98, 0.58)";
  if (intensity > 0.2) return "rgba(186, 164, 103, 0.52)";
  return "rgba(225, 211, 175, 0.75)";
}

function RevenueHeatMap({ jobs }: { jobs: DashboardJob[] }) {
  const services = Array.from(new Set(jobs.map((job) => job.service).filter(Boolean))).sort();
  const areas = Array.from(new Set(jobs.map(getAreaFromJob))).sort();
  const values = new Map<string, number>();

  for (const job of jobs) {
    const key = `${getAreaFromJob(job)}|${job.service}`;
    values.set(key, (values.get(key) ?? 0) + job.revenue);
  }

  const max = Math.max(...values.values(), 0);

  if (jobs.length === 0 || services.length === 0 || areas.length === 0) {
    return (
      <div className="p-4 text-sm text-stone-500">
        No job revenue rows are available for a heatmap yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <div
        className="grid min-w-[680px] gap-px rounded-none border border-stone-200 bg-stone-200 text-xs"
        style={{ gridTemplateColumns: `150px repeat(${services.length}, minmax(110px, 1fr))` }}
      >
        <div className="bg-white p-2 font-semibold text-stone-500">Area / service</div>
        {services.map((service) => (
          <div key={service} className="bg-white p-2 font-semibold text-stone-700">
            {service}
          </div>
        ))}
        {areas.map((area) => (
          <Fragment key={area}>
            <div key={`${area}-label`} className="bg-white p-2 font-semibold text-stone-700">
              {area}
            </div>
            {services.map((service) => {
              const value = values.get(`${area}|${service}`) ?? 0;
              const isDark = value / Math.max(max, 1) > 0.55;
              return (
                <div
                  key={`${area}-${service}`}
                  className={`min-h-16 p-2 ${isDark ? "text-white" : "text-stone-700"}`}
                  style={{ backgroundColor: heatColor(value, max) }}
                  title={`${area} / ${service}: ${money.format(value)}`}
                >
                  <span className="font-semibold">{value > 0 ? money.format(value) : "-"}</span>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Intensity is calculated from Supabase job revenue by area and service.
      </p>
    </div>
  );
}

type RouteStop = {
  job: DashboardJob;
  address: string;
  lat: number;
  lon: number;
};

type RouteState = {
  loading: boolean;
  stops: RouteStop[];
  routeCoordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  unresolved: string[];
  error: string;
};

const MONTREAL_CENTER = { lat: 45.5017, lon: -73.5673 };
const MONTREAL_MAP_ZOOM = 12;
const MONTREAL_MAP_WIDTH = 920;
const MONTREAL_MAP_HEIGHT = 360;

function normalizeMontrealAddress(address: string) {
  const trimmed = address.trim();
  if (!trimmed || /address to confirm/i.test(trimmed)) return "";
  const hasMontreal = /montr[eé]al|westmount|outremont|verdun|lasalle|ndg|notre-dame-de-gr[aâ]ce/i.test(trimmed);
  const hasProvince = /\bQC\b|qu[eé]bec/i.test(trimmed);
  const parts = [trimmed];
  if (!hasMontreal) parts.push("Montréal");
  if (!hasProvince) parts.push("QC");
  parts.push("Canada");
  return parts.join(", ");
}

function lonLatToPixel(lon: number, lat: number, zoom = MONTREAL_MAP_ZOOM) {
  const scale = 256 * 2 ** zoom;
  const x = ((lon + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function projectMontrealPoint(lon: number, lat: number) {
  const center = lonLatToPixel(MONTREAL_CENTER.lon, MONTREAL_CENTER.lat);
  const point = lonLatToPixel(lon, lat);
  return {
    x: point.x - center.x + MONTREAL_MAP_WIDTH / 2,
    y: point.y - center.y + MONTREAL_MAP_HEIGHT / 2,
  };
}

function getMontrealTiles() {
  const center = lonLatToPixel(MONTREAL_CENTER.lon, MONTREAL_CENTER.lat);
  const centerTileX = Math.floor(center.x / 256);
  const centerTileY = Math.floor(center.y / 256);
  const tiles = [];

  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -1; dy <= 2; dy += 1) {
      const tileX = centerTileX + dx;
      const tileY = centerTileY + dy;
      tiles.push({
        key: `${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${MONTREAL_MAP_ZOOM}/${tileX}/${tileY}.png`,
        x: tileX * 256 - center.x + MONTREAL_MAP_WIDTH / 2,
        y: tileY * 256 - center.y + MONTREAL_MAP_HEIGHT / 2,
      });
    }
  }

  return tiles;
}

async function geocodeMontrealJob(job: DashboardJob): Promise<RouteStop | null> {
  const address = normalizeMontrealAddress(job.address);
  if (!address) return null;

  const cacheKey = `stornway-geocode:${address.toLowerCase()}`;
  const cached = window.sessionStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached) as { lat: number; lon: number };
    return { job, address, ...parsed };
  }

  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
    countrycodes: "ca",
    viewbox: "-73.97,45.72,-73.35,45.37",
    bounded: "1",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) return null;
  const [result] = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!result) return null;

  const stop = {
    job,
    address,
    lat: Number(result.lat),
    lon: Number(result.lon),
  };

  if (Number.isFinite(stop.lat) && Number.isFinite(stop.lon)) {
    window.sessionStorage.setItem(cacheKey, JSON.stringify({ lat: stop.lat, lon: stop.lon }));
    return stop;
  }

  return null;
}

async function fetchOsrmRoute(stops: RouteStop[]) {
  if (stops.length < 2) {
    return { routeCoordinates: [], distanceMeters: 0, durationSeconds: 0 };
  }

  const coordinates = stops.map((stop) => `${stop.lon},${stop.lat}`).join(";");
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
  );
  if (!response.ok) throw new Error("OSRM route request failed.");

  const body = (await response.json()) as {
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: [number, number][] };
    }>;
  };
  const route = body.routes?.[0];
  return {
    routeCoordinates: route?.geometry?.coordinates ?? [],
    distanceMeters: route?.distance ?? 0,
    durationSeconds: route?.duration ?? 0,
  };
}

function MapPreview({
  title = "Today's Route Preview",
  rows = [],
}: {
  title?: string;
  rows?: DashboardJob[];
}) {
  const routeJobs = useMemo(() => rows.slice(0, 6), [rows]);
  const [routeState, setRouteState] = useState<RouteState>({
    loading: false,
    stops: [],
    routeCoordinates: [],
    distanceMeters: 0,
    durationSeconds: 0,
    unresolved: [],
    error: "",
  });
  const tiles = useMemo(getMontrealTiles, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      setRouteState((current) => ({ ...current, loading: true, error: "" }));

      try {
        const settledStops = await Promise.all(
          routeJobs.map(async (job) => ({ job, stop: await geocodeMontrealJob(job) })),
        );
        if (cancelled) return;

        const stops = settledStops
          .map((entry) => entry.stop)
          .filter((stop): stop is RouteStop => Boolean(stop));
        const unresolved = settledStops
          .filter((entry) => !entry.stop)
          .map((entry) => entry.job.address);
        const route = await fetchOsrmRoute(stops);
        if (cancelled) return;

        setRouteState({
          loading: false,
          stops,
          unresolved,
          error: "",
          ...route,
        });
      } catch (error) {
        if (cancelled) return;
        setRouteState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Route could not be loaded.",
        }));
      }
    }

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [routeJobs]);

  const routePoints = routeState.routeCoordinates
    .map(([lon, lat]) => projectMontrealPoint(lon, lat))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const kilometers = routeState.distanceMeters / 1000;
  const minutes = Math.round(routeState.durationSeconds / 60);

  return (
    <div className="p-4">
      <div className="relative h-[360px] overflow-hidden rounded-none border border-stone-200 bg-stone-100">
        <div
          className="absolute left-1/2 top-1/2 origin-top-left -translate-x-1/2 -translate-y-1/2"
          style={{ width: MONTREAL_MAP_WIDTH, height: MONTREAL_MAP_HEIGHT }}
        >
          {tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              className="absolute size-[256px] select-none"
              draggable={false}
              style={{ left: tile.x, top: tile.y }}
            />
          ))}
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${MONTREAL_MAP_WIDTH} ${MONTREAL_MAP_HEIGHT}`}
            role="img"
            aria-label="Optimized route through Montreal using OSRM"
          >
            {routePoints ? (
              <polyline
                points={routePoints}
                fill="none"
                stroke="#1e3a0f"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            ) : null}
            {routeState.stops.map((stop, index) => {
              const point = projectMontrealPoint(stop.lon, stop.lat);
              return (
                <g key={`${stop.job.client}-${stop.address}`} transform={`translate(${point.x} ${point.y})`}>
                  <circle r="15" fill="#6aab2e" stroke="#1e3a0f" strokeWidth="3" />
                  <text y="4" textAnchor="middle" fill="#071b06" fontSize="12" fontWeight="800">
                    {index + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-none border border-stone-200 bg-white/95 px-3 py-2 shadow-sm">
          <p className="text-sm font-semibold text-stone-950">{title}</p>
          <p className="text-xs text-stone-500">
            Montréal, QC map. {routeState.loading ? "Loading route..." : `${routeState.stops.length} resolved stops`}
            {routeState.distanceMeters ? `, ${kilometers.toFixed(1)} km, ${minutes} min via OSRM` : ""}
          </p>
          {routeState.error ? <p className="mt-1 text-xs font-semibold text-red-700">{routeState.error}</p> : null}
          {routeState.unresolved.length > 0 ? (
            <p className="mt-1 text-xs text-stone-500">
              Needs exact Montréal address: {routeState.unresolved.slice(0, 2).join("; ")}
            </p>
          ) : null}
        </div>
        {routeJobs.length === 0 ? (
          <div
            className="absolute right-3 top-3 rounded-none border border-stone-200 bg-white/95 px-3 py-2 text-xs font-semibold text-stone-600"
          >
            No scheduled jobs to route.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="m-4 rounded-none border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500">
      <p className="font-semibold text-stone-700">Empty state</p>
      <p className="mt-1">{label}</p>
    </div>
  );
}

function JobsTable({
  compact = false,
  rows = [],
  canComplete = false,
}: {
  compact?: boolean;
  rows?: DashboardJob[];
  canComplete?: boolean;
}) {
  const visibleJobs = rows.slice(0, compact ? 4 : rows.length);
  const showActions = canComplete && visibleJobs.some((job) => job.id);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Service</th>
            <th className="px-4 py-3 font-semibold">Address</th>
            <th className="px-4 py-3 font-semibold">Scheduled time</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Revenue</th>
            {showActions ? <th className="px-4 py-3 text-right font-semibold">Action</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {visibleJobs.map((job) => (
            <tr key={`${job.client}-${job.service}`}>
              <td className="px-4 py-3 font-semibold text-stone-950">{job.client}</td>
              <td className="px-4 py-3 text-stone-600">{job.service}</td>
              <td className="px-4 py-3 text-stone-600">{job.address}</td>
              <td className="px-4 py-3 text-stone-600">{job.date}, {job.time}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(job.status)}>{job.status}</Badge></td>
              <td className="px-4 py-3 text-right font-semibold text-stone-950">{money.format(job.revenue)}</td>
              {showActions ? (
                <td className="px-4 py-3 text-right">
                  {job.id && job.status !== "Completed" ? (
                    <form action="/api/dashboard/jobs/status" method="post">
                      <input type="hidden" name="job_id" value={job.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-none border border-emerald-700 bg-emerald-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
                      >
                        <CheckCircle2 size={14} aria-hidden="true" />
                        Complete
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs font-semibold text-stone-400">Done</span>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
          {visibleJobs.length === 0 ? (
            <tr>
              <td className="px-4 py-5 text-sm text-stone-500" colSpan={showActions ? 7 : 6}>
                No jobs found in Supabase yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleWidget({ rows = [] }: { rows?: DashboardJob[] }) {
  return (
    <div className="space-y-4 p-4">
      {rows.slice(0, 4).map((job, index) => (
        <div key={`schedule-${job.client}`} className="flex gap-3">
          <div className="w-20 text-sm text-stone-500">{job.time.split(" - ")[0]}</div>
          <div className="relative flex-1 border-l border-stone-200 pl-4">
            <span className={`absolute -left-1.5 top-1 size-3 rounded-none ${index % 2 ? "bg-amber-500" : "bg-emerald-600"}`} />
            <p className="text-sm font-semibold text-stone-950">{job.service}</p>
            <p className="mt-0.5 text-xs text-stone-500">{job.client} - {job.crew}</p>
          </div>
        </div>
      ))}
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">No scheduled jobs found in Supabase yet.</p>
      ) : null}
    </div>
  );
}

export function HomeDashboardPage({
  liveCustomers = [],
  liveJobs = [],
  liveQuotes = [],
  liveInvoices = [],
  liveRequestCount = 0,
  role = "ADMIN",
}: {
  liveCustomers?: DashboardCustomer[];
  liveJobs?: DashboardJob[];
  liveQuotes?: DashboardQuote[];
  liveInvoices?: DashboardInvoice[];
  liveRequestCount?: number;
  role?: DashboardRole;
}) {
  const dashboardCustomers = liveCustomers;
  const dashboardJobs = liveJobs;
  const dashboardQuotes = liveQuotes;
  const dashboardInvoices = liveInvoices;
  const openInvoiceBalance = dashboardInvoices.reduce(
    (sum, invoice) => sum + invoice.balance,
    0,
  );
  const acceptedQuoteTotal = dashboardQuotes
    .filter((quote) => quote.status === "Accepted")
    .reduce((sum, quote) => sum + quote.value, 0);
  const homeConversionCounts: ConversionCounts = {
    requests: liveRequestCount,
    quotes: dashboardQuotes.length,
    jobs: dashboardJobs.length,
    invoices: dashboardInvoices.length,
  };
  const homeActions = [
    { label: "Create quote", href: "/dashboard/quotes#quote-delivery" },
    { label: "Create invoice", href: "/dashboard/invoices" },
    { label: "Schedule job", href: "/dashboard/schedule" },
    { label: "Add client", href: "/dashboard/clients" },
  ];

  return (
    <PageShell active="Home" eyebrow="Stornway dashboard" title="Good afternoon, Stornway" role={role}>
      <KpiGrid
        items={[
          { label: "Revenue this month", value: money.format(dashboardJobs.reduce((sum, job) => sum + job.revenue, 0)), detail: "From Supabase jobs", tone: "emerald", icon: BadgeDollarSign },
          { label: "Upcoming jobs", value: String(dashboardJobs.length), detail: "Supabase jobs table", tone: "blue", icon: CalendarDays },
          { label: "Quotes awaiting response", value: String(dashboardQuotes.filter((quote) => ["Sent", "Viewed"].includes(quote.status)).length), detail: `${money.format(acceptedQuoteTotal)} accepted`, tone: "violet", icon: FileText },
          { label: "Outstanding invoices", value: money.format(openInvoiceBalance), detail: `${dashboardInvoices.length} invoices in Supabase`, tone: "orange", icon: WalletCards },
          { label: "Known clients", value: String(dashboardCustomers.length), detail: "Clients or derived leads", tone: "stone", icon: Inbox },
          { label: "Conversion rate", value: dashboardQuotes.length ? `${Math.round((dashboardQuotes.filter((quote) => quote.status === "Accepted").length / dashboardQuotes.length) * 100)}%` : "0%", detail: "Accepted quotes / quotes", tone: "emerald", icon: TrendingUp },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <Card title="Upcoming Jobs" action="View all"><JobsTable rows={dashboardJobs} /></Card>
        <div className="space-y-4">
          <Card title="Today's Schedule" action="Open schedule"><ScheduleWidget rows={dashboardJobs} /></Card>
          <Card title="Quick Actions">
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {homeActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                >
                  <Plus size={16} aria-hidden="true" />{action.label}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Revenue Chart" action="Export"><RevenueChart /></Card>
        <Card title="Lead Conversion Widget"><Funnel steps={[{ label: "Requests", value: homeConversionCounts.requests }, { label: "Quotes", value: homeConversionCounts.quotes }, { label: "Jobs", value: homeConversionCounts.jobs }, { label: "Invoices", value: homeConversionCounts.invoices }]} /></Card>
        <Card title="Revenue Heat Map" action="Open map"><RevenueHeatMap jobs={dashboardJobs} /></Card>
      </div>
      <EmptyState label="If no jobs match the active filters, this area explains how to clear filters or create a new job." />
    </PageShell>
  );
}

export function SchedulePage({
  liveJobs = [],
  role = "ADMIN",
}: {
  liveJobs?: DashboardJob[];
  role?: DashboardRole;
}) {
  const pageJobs = liveJobs;
  const revenue = pageJobs.reduce((sum, job) => sum + job.revenue, 0);

  return (
    <PageShell active="Schedule" eyebrow="Daily operations" title="Schedule" role={role}>
      <KpiGrid
        items={[
          { label: "Jobs", value: String(pageJobs.length), detail: "From Supabase jobs", tone: "blue", icon: CalendarDays },
          { label: "Revenue scheduled", value: money.format(revenue), detail: "Booked route value", tone: "emerald", icon: CircleDollarSign },
          { label: "Unassigned crew", value: String(pageJobs.filter((job) => job.crew === "Unassigned").length), detail: "Needs dispatch", tone: "violet", icon: Clock3 },
          { label: "Open time slots", value: "Not tracked", detail: "Crew availability table not connected yet", tone: "amber", icon: Gauge },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Calendar View" action="Day | Week | Month">
          <div className="grid gap-3 p-4 md:grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="min-h-36 rounded-none border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-semibold uppercase text-stone-400">{day}</p>
                {pageJobs.filter((_, jobIndex) => jobIndex % 7 === index || (index === 0 && jobIndex < 3)).slice(0, 2).map((job) => (
                  <div key={`${day}-${job.client}`} className="mt-3 rounded-none bg-white p-2 shadow-sm">
                    <p className="text-xs font-semibold text-stone-950">{job.client}</p>
                    <p className="truncate text-xs text-stone-500">{job.service}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{money.format(job.revenue)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Route Preview"><MapPreview rows={pageJobs} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <Card title="Scheduled Jobs" action="Dispatch"><JobsTable rows={pageJobs} /></Card>
        <Card title="Filters">
          <div className="grid gap-3 p-4">
            {[
              ["Service Type", ["All services", "Pressure washing", "Window cleaning", "Landscape maintenance", "Mulch installation"]],
              ["Crew", ["All crews", "Crew A", "Crew B", "Crew C"]],
              ["Status", ["All statuses", "Scheduled", "In Progress", "Pending", "Delayed"]],
            ].map(([filter, options]) => (
              <label key={filter as string} className="grid gap-1 text-sm font-semibold text-stone-700">
                {filter as string}
                <select className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600">
                  {(options as string[]).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </Card>
      </div>
      <EmptyState label="No scheduled jobs for this day. Use Schedule job to add work or widen the date range." />
    </PageShell>
  );
}

export function ClientsPage({
  liveCustomers = [],
  role = "ADMIN",
}: {
  liveCustomers?: DashboardCustomer[];
  role?: DashboardRole;
}) {
  const pageCustomers = liveCustomers;
  const detailClient = pageCustomers[0];
  const activeClients = pageCustomers.filter((client) =>
    ["Active", "Recurring", "Contacted", "Lead"].includes(client.status),
  ).length;
  const returningClients = pageCustomers.filter(
    (client) => client.lifetime > 0 || client.status === "Recurring",
  ).length;

  return (
    <PageShell active="Clients" eyebrow="CRM" title="Clients" role={role}>
      <KpiGrid
        items={[
          { label: "Total clients", value: String(pageCustomers.length), detail: "From clients or quote requests", tone: "stone", icon: Users },
          { label: "Active clients", value: String(activeClients), detail: "Active, recurring, or contacted", tone: "emerald", icon: CheckCircle2 },
          { label: "New this month", value: "Live", detail: "Created_at support wired", tone: "blue", icon: Plus },
          { label: "Returning clients", value: String(returningClients), detail: "Recurring or lifetime value recorded", tone: "violet", icon: TrendingUp },
        ]}
      />
      <Card title="CRM source of truth" action="Supabase table: clients">
        <div className="grid gap-3 p-4 text-sm text-stone-600 md:grid-cols-3">
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Clients are their own table</p>
            <p className="mt-1">Do not infer a client only by matching names. Use email/phone plus a `client_id` relationship.</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Requests become clients</p>
            <p className="mt-1">A website request can create or attach to a client once Stornway confirms the lead.</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Jobs, quotes, invoices reference clients</p>
            <p className="mt-1">That gives one account history instead of duplicate rows for the same person.</p>
          </div>
        </div>
      </Card>
      <Card title="Search + Filters" action="Save view">
        <div className="grid gap-3 p-4 md:grid-cols-4">
          {["Name", "Email", "Phone", "Service type"].map((label) => (
            <input key={label} className="rounded-none border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder={label} />
          ))}
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card title="Clients Table (public.clients)" action="Export">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
                <tr>
                  {["Client", "Address", "Email", "Phone", "Last service", "Lifetime value", "Status"].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pageCustomers.map((client) => (
                  <tr key={`${client.email}-${client.phone}-${client.name}`}>
                    <td className="px-4 py-3 font-semibold text-stone-950">{client.name}</td>
                    <td className="px-4 py-3 text-stone-600">{client.address}</td>
                    <td className="px-4 py-3 text-stone-600">{client.email}</td>
                    <td className="px-4 py-3 text-stone-600">{client.phone}</td>
                    <td className="px-4 py-3 text-stone-600">{client.lastService}</td>
                    <td className="px-4 py-3 font-semibold text-stone-950">{money.format(client.lifetime)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(client.status)}>{client.status}</Badge></td>
                  </tr>
                ))}
                {pageCustomers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-sm text-stone-500" colSpan={7}>
                      No clients found in Supabase yet. Website quote requests will still appear under Requests.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Client Detail Drawer" action="Open full profile">
          <div className="space-y-4 p-4">
            {detailClient ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-stone-950">{detailClient.name}</p>
                  <p className="text-sm text-stone-500">{detailClient.type} account - {detailClient.status}</p>
                </div>
                <div className="grid gap-2 text-sm">
                  {detailClient.email ? (
                    <p className="flex items-center gap-2 text-stone-600"><Mail size={15} /> {detailClient.email}</p>
                  ) : null}
                  {detailClient.phone ? (
                    <p className="flex items-center gap-2 text-stone-600"><Phone size={15} /> {detailClient.phone}</p>
                  ) : null}
                  <p className="flex items-center gap-2 text-stone-600"><MapPin size={15} /> {detailClient.address}</p>
                </div>
                <BarChart data={[
                  { label: "Lifetime value", value: detailClient.lifetime },
                  { label: "Known status", value: detailClient.status ? 1 : 0 },
                ]} />
                <p className="rounded-none bg-emerald-50 p-3 text-sm text-emerald-800">Revenue generated: {money.format(detailClient.lifetime)}.</p>
              </>
            ) : (
              <p className="text-sm text-stone-500">No client rows are available for a detail preview yet.</p>
            )}
          </div>
        </Card>
      </div>
      <EmptyState label="No clients match the current search. Clear filters or add a new client." />
    </PageShell>
  );
}

export function RequestsPage({
  liveRequests = [],
  role = "ADMIN",
}: {
  liveRequests?: DashboardRequest[];
  role?: DashboardRole;
}) {
  const canCreateJobs = role === "ADMIN";
  const stages = ["New", "Contacted", "Quote Sent", "Won", "Lost"];
  const allRequests = liveRequests;
  const requestOptions = allRequests.filter((request) => request.email);
  const [selectedRequestId, setSelectedRequestId] = useState(requestOptions[0]?.id ?? "");
  const [selectedQuoteRequestId, setSelectedQuoteRequestId] = useState(allRequests[0]?.id ?? "");
  const [selectedJobRequestId, setSelectedJobRequestId] = useState(allRequests[0]?.id ?? "");
  const selectedEmailRequest =
    requestOptions.find((request) => request.id === selectedRequestId) ??
    requestOptions[0];
  const selectedQuoteRequest =
    allRequests.find((request) => request.id === selectedQuoteRequestId) ??
    allRequests[0];
  const selectedJobRequest =
    allRequests.find((request) => request.id === selectedJobRequestId) ??
    allRequests[0];
  const newRequests = allRequests.filter((request) => request.status === "New").length;
  const contactedRequests = allRequests.filter((request) => request.status === "Contacted").length;
  const quotedRequests = allRequests.filter((request) => request.status === "Quote Sent").length;
  const lostRequests = allRequests.filter((request) => request.status === "Lost").length;
  const quotedValue = allRequests
    .filter((request) => request.status === "Quote Sent")
    .reduce((sum, request) => sum + request.value, 0);
  const leadSourceSegments = getLeadSourceSegments(allRequests);

  return (
    <PageShell active="Requests" eyebrow="Lead inbox" title="Requests" role={role}>
      <KpiGrid
        items={[
          { label: "New requests", value: String(newRequests), detail: "From Supabase quote_requests", tone: "blue", icon: Inbox },
          { label: "Contacted", value: String(contactedRequests), detail: "email_sent marked true", tone: "amber", icon: Phone },
          { label: "Quoted", value: String(quotedRequests), detail: `${money.format(quotedValue)} proposed`, tone: "violet", icon: FileText },
          { label: "Lost", value: String(lostRequests), detail: "Status from request workflow", tone: "red", icon: Bell },
        ]}
      />
      <Card title="Request Pipeline" action="Create quotes from requests">
        <div className="grid gap-3 p-4 lg:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="rounded-none border border-stone-200 bg-stone-50 p-3">
              <p className="text-sm font-semibold text-stone-950">{stage}</p>
              <div className="mt-3 space-y-2">
                {allRequests.filter((request) => request.status === stage).map((request) => (
                  <div key={request.id ?? `${request.name}-${request.date}`} className="rounded-none bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-stone-950">{request.name}</p>
                    <p className="text-xs text-stone-500">{request.service}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      {request.value > 0 ? money.format(request.value) : "Price not set"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {request.email ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequestId(request.id ?? "");
                            document
                              .getElementById("request-email-composer")
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="inline-flex items-center gap-1 rounded-none border border-stone-200 px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                        >
                          <Mail size={12} aria-hidden="true" />
                          Email
                        </button>
                      ) : null}
                      <a
                        href="#request-quote-creator"
                        className="inline-flex items-center gap-1 rounded-none bg-emerald-800 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-900"
                      >
                        <FileText size={12} aria-hidden="true" />
                        Quote
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Create Quote From Request" action="Saves to quotes table">
        <div id="request-quote-creator" className="grid gap-4 p-4 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-3">
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Request
              <select
                value={selectedQuoteRequest?.id ?? ""}
                onChange={(event) => setSelectedQuoteRequestId(event.target.value)}
                className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600"
              >
                {allRequests.length ? (
                  allRequests.map((request) => (
                    <option key={request.id ?? `${request.name}-${request.date}`} value={request.id ?? ""}>
                      {request.name} - {request.service}
                    </option>
                  ))
                ) : (
                  <option value="">No requests available</option>
                )}
              </select>
            </label>
            {selectedQuoteRequest ? (
              <div className="rounded-none border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
                <p className="font-semibold text-stone-950">{selectedQuoteRequest.name}</p>
                <p className="mt-1">{selectedQuoteRequest.email || "No email"}</p>
                <p>{selectedQuoteRequest.phone || "No phone"}</p>
                <p className="mt-2">{selectedQuoteRequest.message || selectedQuoteRequest.service}</p>
              </div>
            ) : (
              <p className="rounded-none border border-stone-200 bg-stone-50 p-3 text-sm text-stone-500">
                No website requests are available yet.
              </p>
            )}
          </div>
          {selectedQuoteRequest ? (
            <RequestQuoteForm key={selectedQuoteRequest.id ?? selectedQuoteRequest.name} request={selectedQuoteRequest} />
          ) : null}
        </div>
      </Card>
      {canCreateJobs ? (
        <Card title="Create Job From Request" action="Saves to jobs table">
          <div className="grid gap-4 p-4 xl:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-3">
              <label className="grid gap-1 text-sm font-semibold text-stone-700">
                Request
                <select
                  value={selectedJobRequest?.id ?? ""}
                  onChange={(event) => setSelectedJobRequestId(event.target.value)}
                  className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600"
                >
                  {allRequests.length ? (
                    allRequests.map((request) => (
                      <option key={request.id ?? `${request.name}-${request.date}`} value={request.id ?? ""}>
                        {request.name} - {request.service}
                      </option>
                    ))
                  ) : (
                    <option value="">No requests available</option>
                  )}
                </select>
              </label>
              {selectedJobRequest ? (
                <div className="rounded-none border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
                  <p className="font-semibold text-stone-950">{selectedJobRequest.name}</p>
                  <p className="mt-1">{selectedJobRequest.email || "No email"}</p>
                  <p>{selectedJobRequest.phone || "No phone"}</p>
                  <p className="mt-2">{selectedJobRequest.message || selectedJobRequest.service}</p>
                </div>
              ) : null}
            </div>
            {selectedJobRequest ? <RequestJobForm request={selectedJobRequest} /> : null}
          </div>
        </Card>
      ) : null}
      <Card title="Send Email From Request" action="Uses Resend">
        <form id="request-email-composer" action="/api/dashboard/email" method="post" className="grid gap-3 p-4 lg:grid-cols-[0.8fr_1fr]">
          <div className="space-y-3">
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Request
              <select
                value={selectedEmailRequest?.id ?? ""}
                onChange={(event) => setSelectedRequestId(event.target.value)}
                className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600"
              >
                {requestOptions.length ? (
                  requestOptions.map((request) => (
                    <option key={request.id ?? request.email} value={request.id ?? ""}>
                      {request.name} - {request.email}
                    </option>
                  ))
                ) : (
                  <option value="">No request emails available</option>
                )}
              </select>
            </label>
            <input type="hidden" name="to" value={selectedEmailRequest?.email ?? ""} />
            <input type="hidden" name="quote_request_id" value={selectedEmailRequest?.id ?? ""} />
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Subject
              <input
                name="subject"
                defaultValue="Stornway quote request"
                className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
              />
            </label>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Message
              <textarea
                name="message"
                rows={5}
                defaultValue={`Hi ${selectedEmailRequest?.name ?? ""},\n\nThanks for reaching out to Stornway Group. We can help with ${selectedEmailRequest?.service ?? "your request"}. Reply here with any details you want us to include in the quote.\n\nStornway Group`}
                className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
              />
            </label>
            <button
              type="submit"
              disabled={!selectedEmailRequest?.email}
              className="inline-flex w-fit items-center gap-2 rounded-none bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Send size={16} aria-hidden="true" />
              Send email
            </button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card title="Requests Table" action="Create quote">
          <div className="overflow-x-auto">
            <table id="requests-table" className="min-w-[840px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
                <tr>{["Name", "Contact", "Service Requested", "Date", "Lead Source", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allRequests.map((request) => (
                  <tr key={request.id ?? `${request.name}-${request.date}`} className="align-top">
                    <td className="px-4 py-3 font-semibold">{request.name}</td>
                    <td className="px-4 py-3 text-stone-600">
                      <p>{request.email || "No email"}</p>
                      <p className="text-xs">{request.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{request.service}</td>
                    <td className="px-4 py-3 text-stone-600">{request.date}</td>
                    <td className="px-4 py-3 text-stone-600">{request.source}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(request.status)}>{request.status}</Badge></td>
                  </tr>
                ))}
                {allRequests.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-sm text-stone-500" colSpan={6}>
                      No requests found in Supabase yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Lead Source Breakdown">
          <PieChart title="Lead sources" segments={leadSourceSegments} />
        </Card>
      </div>
      <EmptyState label="No incoming requests in this source or status. New website form submissions will appear here." />
    </PageShell>
  );
}

function RequestQuoteForm({ request }: { request: DashboardRequest }) {
  const [lineItems, setLineItems] = useState<EditableLineItem[]>([
    makeEditableLineItem(request.service, request.message ?? ""),
  ]);
  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <form action="/api/dashboard/quotes" method="post" className="grid gap-3">
      <input type="hidden" name="quote_request_id" value={request.id ?? ""} />
      <input type="hidden" name="client_name" value={request.name} />
      <input type="hidden" name="client_email" value={request.email ?? ""} />
      <input type="hidden" name="client_phone" value={request.phone ?? ""} />
      <input type="hidden" name="service_type" value={request.service} />
      <label className="grid gap-1 text-sm font-semibold text-stone-700">
        Address
        <input
          name="client_address"
          defaultValue={request.address === "Address to confirm" ? "" : request.address}
          placeholder="Client address"
          className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
        />
      </label>
      <LineItemsEditor items={lineItems} onItemsChange={setLineItems} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
        <p className="text-sm font-semibold text-stone-800">
          Total: {moneyWithCents.format(total)}
        </p>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input name="send_email" type="checkbox" className="size-4 accent-emerald-800" />
          Send quote email
        </label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
          <FileText size={16} aria-hidden="true" />
          Create quote
        </button>
      </div>
    </form>
  );
}

function RequestJobForm({ request }: { request: DashboardRequest }) {
  return (
    <form action="/api/dashboard/jobs" method="post" className="grid gap-3">
      <input type="hidden" name="client_name" value={request.name} />
      <input type="hidden" name="client_email" value={request.email ?? ""} />
      <input type="hidden" name="client_phone" value={request.phone ?? ""} />
      <label className="grid gap-1 text-sm font-semibold text-stone-700">
        Service
        <input
          name="service_type"
          required
          defaultValue={request.service}
          className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-stone-700">
        Job address
        <input
          name="client_address"
          required
          defaultValue={request.address === "Address to confirm" ? "" : request.address}
          placeholder="Client address"
          className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          Start
          <input
            name="scheduled_start"
            required
            type="datetime-local"
            className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-700">
          End
          <input
            name="scheduled_end"
            type="datetime-local"
            className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold text-stone-700">
        Notes
        <textarea
          name="notes"
          rows={4}
          defaultValue={request.message ?? ""}
          className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
        />
      </label>
      <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-none bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
        <CalendarDays size={16} aria-hidden="true" />
        Create job
      </button>
    </form>
  );
}

function makeEditableLineItem(
  product = "Exterior service",
  description = "",
): EditableLineItem {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    product,
    description,
    quantity: 1,
    unitPrice: 0,
  };
}

function LineItemsEditor({
  items,
  onItemsChange,
  compact = false,
}: {
  items: EditableLineItem[];
  onItemsChange: (items: EditableLineItem[]) => void;
  compact?: boolean;
}) {
  const updateItem = (
    id: string,
    patch: Partial<Omit<EditableLineItem, "id">>,
  ) => {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };
  const removeItem = (id: string) => {
    if (items.length === 1) return;
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-800">Line items</p>
        <button
          type="button"
          onClick={() => onItemsChange([...items, makeEditableLineItem("", "")])}
          className="inline-flex items-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
        >
          <Plus size={14} aria-hidden="true" />
          Add item
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_1.15fr_80px_120px_32px]">
              <label className="grid gap-1 text-xs font-semibold text-stone-700">
                Product/service
                <input
                  name="product_service"
                  required={index === 0}
                  value={item.product}
                  onChange={(event) => updateItem(item.id, { product: event.target.value })}
                  className="rounded-none border border-stone-200 bg-white px-2 py-1.5 font-normal text-stone-600"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-stone-700">
                Description
                <input
                  name="description"
                  value={item.description}
                  onChange={(event) => updateItem(item.id, { description: event.target.value })}
                  className="rounded-none border border-stone-200 bg-white px-2 py-1.5 font-normal text-stone-600"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-stone-700">
                Qty.
                <input
                  name="quantity"
                  required={index === 0}
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) || 1 })}
                  className="rounded-none border border-stone-200 bg-white px-2 py-1.5 font-normal text-stone-600"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-stone-700">
                Unit price
                <input
                  name="unit_price"
                  required={index === 0}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) || 0 })}
                  className="rounded-none border border-stone-200 bg-white px-2 py-1.5 font-normal text-stone-600"
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                aria-label="Remove line item"
                className="mt-5 inline-flex size-8 items-center justify-center rounded-none border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
            {!compact ? (
              <p className="mt-2 text-right text-xs font-semibold text-stone-500">
                {moneyWithCents.format(item.quantity * item.unitPrice)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteDocumentPreview({
  quote,
  documentType,
}: {
  quote: Quote;
  documentType: "Quote" | "Invoice";
}) {
  const total = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const [street, cityLine = "Montreal, QC"] = quote.address.split(/,\s*(?=[^,]+,\s*QC|Montreal|Westmount|Notre-Dame)/);
  const sentLabel = documentType === "Invoice" ? "Issued on:" : "Sent on:";
  const totalLabel = documentType === "Invoice" ? "Total Due" : "Total Estimate";
  const headingNumber =
    documentType === "Invoice"
      ? quote.number.replace(/^Q-?/, "INVOICE #")
      : quote.number.replace(/^Q-?10/, "QUOTE #");

  return (
    <div className="overflow-x-auto bg-stone-100 p-3">
      <div className="invoice-document mx-auto min-h-[860px] w-[760px] bg-white px-10 py-12 text-[#27272a] shadow-sm">
        <div className="grid grid-cols-[190px_1fr] gap-16">
          <div className="flex size-28 items-center justify-center bg-[#071b06] p-3">
            <img src="/stornwaylogo1.svg" alt="Stornway Group" className="w-full" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold uppercase tracking-normal text-[#2a2a2a]">
              {headingNumber}
            </h3>
            <div className="mt-2 border-t-2 border-[#556052] pt-3">
              <p className="text-xs font-extrabold uppercase text-[#2a2a2a]">{sentLabel}</p>
              <p className="mt-4 border-b border-stone-300 pb-2 text-base font-semibold text-stone-500">
                {quote.created}
              </p>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-stone-300" />

        <div className="grid grid-cols-2 gap-14">
          <div>
            <p className="text-xs font-extrabold uppercase text-stone-500">Recipient:</p>
            <p className="mt-2 text-xl font-extrabold">{quote.client}</p>
            <p className="mt-2 leading-tight">
              {street}
              <br />
              {cityLine}
              <br />
              Phone: {quote.phone}
            </p>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase text-stone-500">Sender:</p>
            <p className="mt-2 text-xl font-extrabold">Stornway Group</p>
            <p className="mt-2 leading-tight">
              Residential and commercial exterior services
              <br />
              Phone: 514-758-6241
              <br />
              Email: info@stornway.com
              <br />
              Website: stornway.com
            </p>
          </div>
        </div>

        <table className="mt-10 w-full table-fixed text-left text-sm">
          <thead className="bg-[#071b06] text-white">
            <tr>
              <th className="w-[22%] px-3 py-2 font-extrabold">Product/Service</th>
              <th className="w-[36%] border-l border-white/25 px-3 py-2 font-extrabold">Description</th>
              <th className="w-[15%] border-l border-white/25 px-3 py-2 text-center font-extrabold">Qty.</th>
              <th className="w-[20%] border-l border-white/25 px-3 py-2 font-extrabold">Unit Price</th>
              <th className="w-[17%] border-l border-white/25 px-3 py-2 font-extrabold">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item) => (
              <tr key={item.product} className="border-b border-stone-100 align-top">
                <td className="px-3 py-3 font-medium leading-tight">{item.product}</td>
                <td className="px-3 py-3 leading-tight">{item.description}</td>
                <td className="px-3 py-3 text-center">{item.quantity}</td>
                <td className="px-3 py-3">{moneyWithCents.format(item.unitPrice)}</td>
                <td className="px-3 py-3 font-semibold">
                  {moneyWithCents.format(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-sm">* Non-taxable</p>

        <div className="mt-8 flex items-center justify-end gap-4">
          <p className="text-base font-extrabold">{totalLabel}</p>
          <p className="min-w-28 border border-stone-300 px-4 py-2 text-right text-base font-semibold">
            {moneyWithCents.format(total)}
          </p>
        </div>

        <p className="mt-[440px] text-base">
          {documentType === "Invoice"
            ? "Payment is due by the date shown above. Please contact Stornway Group with any questions."
            : "This quote is valid for the next 30 days, after which values may be subject to change."}
        </p>
      </div>
    </div>
  );
}

function QuoteDeliveryPanel({ rows }: { rows: DashboardQuote[] }) {
  const [selectedNumber, setSelectedNumber] = useState(rows[0]?.number ?? "");
  const [documentType, setDocumentType] = useState<"Quote" | "Invoice">("Quote");
  const selectedQuote = useMemo(
    () => rows.find((quote) => quote.number === selectedNumber) ?? rows[0],
    [rows, selectedNumber],
  );
  if (!selectedQuote) {
    return (
      <Card title="Send quote / generate invoice" action="Supabase table: quotes">
        <div className="p-4 text-sm text-stone-500">
          No quotes found in Supabase yet. Create an accepted quote record to preview and send documents here.
        </div>
      </Card>
    );
  }
  const defaultMessage = `Hi ${selectedQuote.client},\n\nHere is your Stornway ${documentType.toLowerCase()} for ${selectedQuote.service}: ${moneyWithCents.format(selectedQuote.value)}.\n\nReply here with any questions or to approve.\n\nStornway Group`;

  return (
    <div id="quote-delivery" className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
      <Card title="Send quote / generate invoice" action="Connected next: quotes table">
        <div className="space-y-4 p-4">
          <label className="grid gap-1 text-sm font-semibold text-stone-700">
            Quote
            <select
              value={selectedNumber}
              onChange={(event) => setSelectedNumber(event.target.value)}
              className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600"
            >
              {rows.map((quote) => (
                <option key={quote.number} value={quote.number}>
                  {quote.number} - {quote.client} - {moneyWithCents.format(quote.value)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Preview
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as "Quote" | "Invoice")}
                className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600"
              >
                <option>Quote</option>
                <option>Invoice</option>
              </select>
            </label>
          </div>

          <div className="rounded-none border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
            <p className="font-semibold text-stone-950">{selectedQuote.client}</p>
            <p className="mt-1">{selectedQuote.email}</p>
            <p>{selectedQuote.phone}</p>
            <p className="mt-2">{selectedQuote.service}</p>
          </div>

          <form action="/api/dashboard/send-document" method="post" className="grid gap-3">
            <input type="hidden" name="document_type" value={documentType} />
            <input type="hidden" name="document_number" value={selectedQuote.number} />
            <input type="hidden" name="to" value={selectedQuote.email} />
            <input type="hidden" name="return_to" value="/dashboard/quotes" />
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Subject
              <input
                name="subject"
                defaultValue={`Stornway ${selectedQuote.number}`}
                className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Message
              <textarea
                name="message"
                rows={5}
                defaultValue={defaultMessage}
                className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
              />
            </label>
            <button
              type="submit"
              disabled={!selectedQuote.email}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Send size={16} aria-hidden="true" />
              Send with Resend
            </button>
          </form>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Download size={16} aria-hidden="true" />
              Print/PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Eye size={16} aria-hidden="true" />
              Preview
            </button>
          </div>
        </div>
      </Card>
      <Card title={`${documentType} preview`}>
        <QuoteDocumentPreview quote={selectedQuote} documentType={documentType} />
      </Card>
    </div>
  );
}

export function QuotesPage({
  liveQuotes = [],
  role = "ADMIN",
}: {
  liveQuotes?: DashboardQuote[];
  role?: DashboardRole;
}) {
  const pageQuotes = liveQuotes;
  const pageAcceptedQuotes = pageQuotes.filter((quote) => quote.status === "Accepted");
  const pageAcceptedForecast = pageAcceptedQuotes.reduce(
    (total, quote) => total + quote.value,
    0,
  );

  return (
    <PageShell active="Quotes" eyebrow="Sales pipeline" title="Quotes" role={role}>
      <KpiGrid
        items={[
          { label: "Draft quotes", value: String(pageQuotes.filter((quote) => quote.status === "Draft").length), detail: "Supabase quotes", tone: "amber", icon: ClipboardList },
          { label: "Sent quotes", value: String(pageQuotes.filter((quote) => ["Sent", "Viewed"].includes(quote.status)).length), detail: "Awaiting response", tone: "blue", icon: FileText },
          { label: "Accepted quotes", value: String(pageAcceptedQuotes.length), detail: `${money.format(pageAcceptedForecast)} to schedule`, tone: "emerald", icon: FileCheck2 },
          { label: "Conversion rate", value: pageQuotes.length ? `${Math.round((pageAcceptedQuotes.length / pageQuotes.length) * 100)}%` : "0%", detail: "Accepted / total quotes", tone: "violet", icon: TrendingUp },
        ]}
      />
      <QuoteDeliveryPanel rows={pageQuotes} />
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Quote Funnel"><Funnel steps={[{ label: "Quotes", value: pageQuotes.length }, { label: "Sent", value: pageQuotes.filter((quote) => ["Sent", "Viewed", "Accepted"].includes(quote.status)).length }, { label: "Viewed", value: pageQuotes.filter((quote) => quote.status === "Viewed").length }, { label: "Accepted", value: pageAcceptedQuotes.length }]} /></Card>
        <Card title="Revenue Forecast"><RevenueChart data={[{ label: "Draft", value: pageQuotes.filter((quote) => quote.status === "Draft").reduce((sum, quote) => sum + quote.value, 0) }, { label: "Sent", value: pageQuotes.filter((quote) => quote.status === "Sent").reduce((sum, quote) => sum + quote.value, 0) }, { label: "Viewed", value: pageQuotes.filter((quote) => quote.status === "Viewed").reduce((sum, quote) => sum + quote.value, 0) }, { label: "Accepted", value: pageAcceptedForecast }]} /></Card>
      </div>
      <Card title="Quotes Table" action="Create quote">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>{["Client", "Quote #", "Service", "Value", "Created", "Status", "Send"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pageQuotes.map((quote) => (
                <tr key={quote.number}>
                  <td className="px-4 py-3 font-semibold">{quote.client}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.number}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.service}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(quote.value)}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.created}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(quote.status)}>{quote.status}</Badge></td>
                  <td className="px-4 py-3">
                    <form action="/api/dashboard/send-document" method="post">
                      <input type="hidden" name="document_type" value="Quote" />
                      <input type="hidden" name="document_number" value={quote.number} />
                      <input type="hidden" name="to" value={quote.email} />
                      <input type="hidden" name="subject" value={`Stornway ${quote.number}`} />
                      <input type="hidden" name="return_to" value="/dashboard/quotes" />
                      <input
                        type="hidden"
                        name="message"
                        value={`Hi ${quote.client},\n\nHere is your Stornway quote for ${quote.service}: ${moneyWithCents.format(quote.value)}.\n\nReply here with any questions or to approve.\n\nStornway Group`}
                      />
                      <button
                        type="submit"
                        disabled={!quote.email}
                        className="inline-flex items-center gap-2 rounded-none border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                      <Mail size={14} aria-hidden="true" />
                        Send
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {pageQuotes.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-sm text-stone-500" colSpan={7}>
                    No quotes found in Supabase yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      <EmptyState label="No quotes match this status. Use Create quote to start a washing or landscaping estimate." />
    </PageShell>
  );
}

export function JobsPage({
  liveJobs = [],
  role = "ADMIN",
}: {
  liveJobs?: DashboardJob[];
  role?: DashboardRole;
}) {
  const pageJobs = liveJobs;
  const revenue = pageJobs.reduce((sum, job) => sum + job.revenue, 0);
  const jobStatusSegments = ["Scheduled", "In Progress", "Pending", "Completed", "Delayed"].map((status, index) => ({
    label: status,
    value: pageJobs.filter((job) => job.status === status).length,
    color: ["#3080ff", "#f99c00", "#baa467", "#009767", "#bf000f"][index],
  }));

  return (
    <PageShell active="Jobs" eyebrow="Work management" title="Jobs" role={role}>
      <KpiGrid
        items={[
          { label: "Active jobs", value: String(pageJobs.filter((job) => ["In Progress", "Scheduled", "Pending"].includes(job.status)).length), detail: "From Supabase jobs", tone: "blue", icon: Wrench },
          { label: "Scheduled jobs", value: String(pageJobs.filter((job) => job.status === "Scheduled").length), detail: "Jobs table status", tone: "violet", icon: CalendarDays },
          { label: "Completed jobs", value: String(pageJobs.filter((job) => job.status === "Completed").length), detail: "Jobs table status", tone: "emerald", icon: CheckCircle2 },
          { label: "Revenue scheduled", value: money.format(revenue), detail: "Booked work value", tone: "emerald", icon: BadgeDollarSign },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card title="Job Status Breakdown">
          <PieChart title="Job status" segments={jobStatusSegments} />
        </Card>
        <Card title="Map View"><MapPreview title="Upcoming Jobs Map" rows={pageJobs} /></Card>
      </div>
      <Card title="Jobs Table" action={role === "ADMIN" ? "Schedule job" : "Assigned work"}>
        <JobsTable rows={pageJobs} canComplete={role === "ADMIN" || role === "TECHNICIAN"} />
      </Card>
      <EmptyState label="No jobs in this crew or service filter. Schedule a new job or change filters." />
    </PageShell>
  );
}

function InvoiceCreator() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [lineItems, setLineItems] = useState<EditableLineItem[]>([
    makeEditableLineItem("Exterior service", "Exterior cleaning service."),
  ]);
  const [dueAt, setDueAt] = useState("");
  const [emailMessage, setEmailMessage] = useState(
    "Hi,\n\nYour Stornway invoice is ready. Please reply here with any questions.\n\nStornway Group",
  );
  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const firstLineItem = lineItems[0];
  const previewQuote: Quote = {
    client: clientName || "Client name",
    email: clientEmail,
    phone: clientPhone || "Phone to confirm",
    address: clientAddress || "Client address, Montreal, QC",
    number: "INV-Preview",
    service: firstLineItem?.product || "Exterior service",
    value: total,
    created: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    status: "Draft",
    lineItems: lineItems.map((item) => ({
      product: item.product || "Service",
      description: item.description || "Service description",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };

  return (
    <div id="invoice-creator" className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <Card title="Invoice Creator" action="Writes to invoices table">
        <form action="/api/dashboard/invoices" method="post" className="grid gap-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Client name
              <input name="client_name" required value={clientName} onChange={(event) => setClientName(event.target.value)} className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Email
              <input name="client_email" type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Phone
              <input name="client_phone" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-700">
              Due date
              <input name="due_at" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600" />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-semibold text-stone-700">
            Address
            <input name="client_address" value={clientAddress} onChange={(event) => setClientAddress(event.target.value)} className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600" />
          </label>
          <LineItemsEditor items={lineItems} onItemsChange={setLineItems} />
          <label className="grid gap-1 text-sm font-semibold text-stone-700">
            Email message
            <textarea
              name="email_message"
              rows={5}
              value={emailMessage}
              onChange={(event) => setEmailMessage(event.target.value)}
              className="rounded-none border border-stone-200 px-3 py-2 text-sm font-normal text-stone-600"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <p className="mr-auto self-center text-sm font-semibold text-stone-800">
              Total: {moneyWithCents.format(total)}
            </p>
            <button name="intent" value="save" type="submit" className="inline-flex w-fit items-center gap-2 rounded-none border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100">
              <ReceiptText size={16} aria-hidden="true" />
              Save invoice
            </button>
            <button name="intent" value="save_send" type="submit" className="inline-flex w-fit items-center gap-2 rounded-none bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
              <Send size={16} aria-hidden="true" />
              Save & send
            </button>
          </div>
        </form>
      </Card>
      <Card title="Invoice Preview">
        <QuoteDocumentPreview quote={previewQuote} documentType="Invoice" />
      </Card>
    </div>
  );
}

export function InvoicesPage({
  liveInvoices = [],
  role = "ADMIN",
}: {
  liveInvoices?: DashboardInvoice[];
  role?: DashboardRole;
}) {
  const pageInvoices = liveInvoices;
  const outstanding = pageInvoices.reduce((sum, invoice) => sum + invoice.balance, 0);
  const paidCount = pageInvoices.filter((invoice) => invoice.status === "Paid").length;
  const overdueCount = pageInvoices.filter((invoice) => invoice.status === "Overdue").length;
  const invoiceTotal = pageInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const invoicePaid = pageInvoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const invoiceStatusSegments = ["Paid", "Pending", "Overdue", "Sent", "Draft"].map((status, index) => ({
    label: status,
    value: pageInvoices.filter((invoice) => invoice.status === status).length,
    color: ["#009767", "#f99c00", "#bf000f", "#3080ff", "#79716b"][index],
  }));

  return (
    <PageShell active="Invoices" eyebrow="Payments" title="Invoices" role={role}>
      <KpiGrid
        items={[
          { label: "Outstanding balance", value: money.format(outstanding), detail: `${pageInvoices.length} invoices in Supabase`, tone: "orange", icon: WalletCards },
          { label: "Paid invoices", value: String(paidCount), detail: "Status = paid", tone: "emerald", icon: CheckCircle2 },
          { label: "Overdue invoices", value: String(overdueCount), detail: "Status = overdue", tone: "red", icon: Bell },
          { label: "Average payment time", value: "Not tracked", detail: "Needs payment timestamp", tone: "blue", icon: Clock3 },
        ]}
      />
      <InvoiceCreator />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Accounts Receivable Chart"><RevenueChart data={[{ label: "Total", value: invoiceTotal }, { label: "Paid", value: invoicePaid }, { label: "Balance", value: outstanding }]} /></Card>
        <Card title="Payment Status Breakdown">
          <PieChart title="Payment status" segments={invoiceStatusSegments} />
        </Card>
      </div>
      <Card title="Invoice Table" action="Send from dashboard">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>{["Invoice #", "Client", "Due Date", "Amount", "Paid", "Balance", "Status", "Send"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pageInvoices.map((invoice) => (
                <tr key={invoice.number}>
                  <td className="px-4 py-3 font-semibold">{invoice.number}</td>
                  <td className="px-4 py-3 text-stone-600">{invoice.client}</td>
                  <td className="px-4 py-3 text-stone-600">{invoice.due}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(invoice.amount)}</td>
                  <td className="px-4 py-3 text-stone-600">{money.format(invoice.paid)}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(invoice.balance)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></td>
                  <td className="px-4 py-3">
                    <details className="w-[260px] rounded-none border border-stone-200 bg-white">
                      <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-emerald-800">
                        Send invoice
                      </summary>
                      <form action="/api/dashboard/send-document" method="post" className="grid gap-2 border-t border-stone-200 p-3">
                        <input type="hidden" name="document_type" value="Invoice" />
                        <input type="hidden" name="document_number" value={invoice.number} />
                        <input type="hidden" name="to" value={invoice.email} />
                        <input type="hidden" name="return_to" value="/dashboard/invoices" />
                        <label className="grid gap-1 text-xs font-semibold text-stone-700">
                          Subject
                          <input
                            name="subject"
                            defaultValue={`Stornway ${invoice.number}`}
                            className="rounded-none border border-stone-200 px-2 py-1.5 font-normal text-stone-600"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-stone-700">
                          Message
                          <textarea
                            name="message"
                            rows={4}
                            defaultValue={`Hi ${invoice.client},\n\nYour Stornway invoice is ready. Total due: ${moneyWithCents.format(invoice.balance || invoice.amount)}.\n\nPlease reply here with any questions.\n\nStornway Group`}
                            className="rounded-none border border-stone-200 px-2 py-1.5 font-normal text-stone-600"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={!invoice.email}
                          className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300"
                        >
                          <Send size={14} aria-hidden="true" />
                          Send with Resend
                        </button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
              {pageInvoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-sm text-stone-500" colSpan={8}>
                    No invoices found in Supabase yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      <EmptyState label="No invoices match the selected payment status. Create an invoice from a completed job." />
    </PageShell>
  );
}

export function InsightsPage({
  liveCustomers = [],
  liveJobs = [],
  liveQuotes = [],
  liveInvoices = [],
  role = "ADMIN",
}: {
  liveCustomers?: DashboardCustomer[];
  liveJobs?: DashboardJob[];
  liveQuotes?: DashboardQuote[];
  liveInvoices?: DashboardInvoice[];
  role?: DashboardRole;
}) {
  const acceptedLiveQuotes = liveQuotes.filter((quote) => quote.status === "Accepted");
  const liveAcceptedForecast = acceptedLiveQuotes.reduce(
    (total, quote) => total + quote.value,
    0,
  );
  const recurringForecast = liveCustomers.filter((client) => client.status === "Recurring").length * 500;
  const completedRevenue = liveJobs
    .filter((job) => job.status === "Completed")
    .reduce((total, job) => total + job.revenue, 0);
  const paidRevenue = liveInvoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + invoice.paid, 0);

  return (
    <PageShell active="Insights" eyebrow="Business intelligence" title="Insights" role={role}>
      <KpiGrid
        items={[
          { label: "Repeat customer rate", value: "Not tracked", detail: "Requires repeat completed jobs", tone: "emerald", icon: Users },
          { label: "Average customer value", value: liveCustomers.length ? money.format(Math.round(paidRevenue / liveCustomers.length)) : "$0", detail: "Paid invoices / clients", tone: "blue", icon: BadgeDollarSign },
          { label: "Completed job revenue", value: money.format(completedRevenue), detail: "Supabase jobs", tone: "violet", icon: TrendingUp },
          { label: "Forecast next month", value: money.format(liveAcceptedForecast + recurringForecast), detail: "Accepted + recurring", tone: "emerald", icon: BarChart3 },
        ]}
      />
      <Card title="Forecast source of truth" action="Supabase tables: quotes + jobs + invoices">
        <div className="grid gap-3 p-4 text-sm text-stone-600 lg:grid-cols-4">
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Accepted quotes</p>
            <p className="mt-1">{money.format(liveAcceptedForecast)} from quotes with status `accepted`.</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Scheduled jobs</p>
            <p className="mt-1">Jobs forecast operational capacity and expected completion dates.</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Invoices</p>
            <p className="mt-1">Invoices become actual revenue once issued and paid.</p>
          </div>
          <div className="rounded-none border border-stone-200 bg-stone-50 p-3">
            <p className="font-semibold text-stone-950">Adjustments</p>
            <p className="mt-1">Only use for seasonality or known recurring work that has no quote yet.</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Monthly Revenue"><RevenueChart data={[{ label: "Paid", value: paidRevenue }, { label: "Jobs", value: completedRevenue }, { label: "Accepted", value: liveAcceptedForecast }, { label: "Recurring", value: recurringForecast }]} /></Card>
        <Card title="Revenue by Service"><BarChart data={liveJobs.length > 0 ? liveJobs.map((job) => ({ label: job.service, value: job.revenue })) : []} /></Card>
        <Card title="Revenue by Client"><BarChart data={liveCustomers.slice(0, 5).map((client) => ({ label: client.name, value: client.lifetime }))} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Revenue Heat Map"><RevenueHeatMap jobs={liveJobs} /></Card>
        <Card title="Lead Conversion Analytics"><Funnel steps={[{ label: "Clients", value: liveCustomers.length }, { label: "Quotes", value: liveQuotes.length }, { label: "Jobs", value: liveJobs.length }, { label: "Invoices", value: liveInvoices.length }]} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Geographic Analytics">
          <div className="divide-y divide-stone-100">
            {liveCustomers.map((area) => (
              <div key={`${area.city}-${area.name}`} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-stone-950">{area.city}</p>
                  <p className="text-xs text-stone-500">{area.name}</p>
                </div>
                <p className="font-semibold text-stone-950">{money.format(area.lifetime)}</p>
              </div>
            ))}
            {liveCustomers.length === 0 ? (
              <div className="px-4 py-5 text-sm text-stone-500">No client geography found in Supabase yet.</div>
            ) : null}
          </div>
        </Card>
        <Card title="Service Analytics"><BarChart data={liveJobs.map((job) => ({ label: job.service, value: job.revenue }))} /></Card>
        <Card title="Revenue Forecast">
          <div className="space-y-3 p-4">
            {[
              ["Accepted quotes", liveAcceptedForecast],
              ["Recurring customers", recurringForecast],
              ["Adjustments", 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-none border border-stone-200 p-3">
                <p className="text-sm font-semibold text-stone-950">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">{money.format(Number(value))}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <EmptyState label="No analytics are available for this segment yet. Try a wider date range or all services." />
    </PageShell>
  );
}
