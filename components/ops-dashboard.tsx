import type { ReactNode } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  Home,
  Inbox,
  LayoutDashboard,
  Mail,
  Map,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  ReceiptText,
  Route,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Wrench,
} from "lucide-react";

type Tone = "emerald" | "blue" | "amber" | "red" | "violet" | "stone" | "orange";

type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: typeof BadgeDollarSign;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Requests", href: "/dashboard/requests", icon: Inbox, count: 5 },
  { label: "Quotes", href: "/dashboard/quotes", icon: FileText, count: 8 },
  { label: "Jobs", href: "/dashboard/jobs", icon: Wrench, count: 14 },
  { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText, count: 7 },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
];

const customers = [
  {
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "(514) 555-0184",
    address: "123 Maple St, Burlington",
    city: "Burlington",
    postal: "L7R 2J4",
    service: "Pressure Washing",
    lastService: "May 18, 2026",
    lifetime: 2840,
    status: "Active",
    type: "Washing",
  },
  {
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "(514) 555-0119",
    address: "456 Oak Ave, Oakville",
    city: "Oakville",
    postal: "L6H 1A8",
    service: "Lawn Care",
    lastService: "May 27, 2026",
    lifetime: 4960,
    status: "Recurring",
    type: "Landscaping",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "(514) 555-0198",
    address: "789 Pine Rd, Milton",
    city: "Milton",
    postal: "L9T 5B6",
    service: "Window Cleaning",
    lastService: "Apr 30, 2026",
    lifetime: 1680,
    status: "Active",
    type: "Washing",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(514) 555-0126",
    address: "321 Cedar Ln, Burlington",
    city: "Burlington",
    postal: "L7L 3V2",
    service: "Garden Bed Installation",
    lastService: "May 6, 2026",
    lifetime: 3420,
    status: "Active",
    type: "Landscaping",
  },
  {
    name: "Cedar Lane Condos",
    email: "manager@cedarlane.example",
    phone: "(514) 555-0142",
    address: "88 Cedar Lane, Westmount",
    city: "Westmount",
    postal: "H3Y 2S7",
    service: "Seasonal Cleanup",
    lastService: "May 22, 2026",
    lifetime: 11950,
    status: "Commercial",
    type: "Both",
  },
  {
    name: "North Ridge HOA",
    email: "board@northridge.example",
    phone: "(514) 555-0130",
    address: "12 Ridgeview Dr, Montreal",
    city: "Montreal",
    postal: "H4A 1C9",
    service: "Mulch Installation",
    lastService: "Apr 12, 2026",
    lifetime: 8750,
    status: "Follow-up",
    type: "Landscaping",
  },
];

const jobs = [
  {
    client: "Robert Johnson",
    service: "Pressure Wash - Driveway & Patio",
    address: "123 Maple St, Burlington",
    date: "Jun 1",
    time: "9:00 AM - 11:00 AM",
    crew: "Crew A",
    status: "Scheduled",
    revenue: 640,
  },
  {
    client: "Sarah Williams",
    service: "Landscape Maintenance",
    address: "456 Oak Ave, Oakville",
    date: "Jun 1",
    time: "10:00 AM - 12:00 PM",
    crew: "Crew B",
    status: "In Progress",
    revenue: 520,
  },
  {
    client: "Michael Brown",
    service: "Exterior Window Cleaning",
    address: "789 Pine Rd, Milton",
    date: "Jun 1",
    time: "1:00 PM - 3:00 PM",
    crew: "Crew A",
    status: "Pending",
    revenue: 380,
  },
  {
    client: "Emily Davis",
    service: "Garden Bed Installation",
    address: "321 Cedar Ln, Burlington",
    date: "Jun 2",
    time: "9:00 AM - 1:00 PM",
    crew: "Crew C",
    status: "Scheduled",
    revenue: 1250,
  },
  {
    client: "Cedar Lane Condos",
    service: "Spring Cleanup + Mulch",
    address: "88 Cedar Lane, Westmount",
    date: "Jun 3",
    time: "8:00 AM - 2:00 PM",
    crew: "Crew B",
    status: "Scheduled",
    revenue: 2640,
  },
  {
    client: "North Ridge HOA",
    service: "Mulch Installation",
    address: "12 Ridgeview Dr, Montreal",
    date: "Jun 4",
    time: "9:00 AM - 3:00 PM",
    crew: "Crew C",
    status: "Delayed",
    revenue: 3180,
  },
];

export type DashboardRequest = {
  name: string;
  service: string;
  address: string;
  date: string;
  source: string;
  status: string;
  value: number;
};

const mockRequests: DashboardRequest[] = [
  { name: "Amelia Roberts", service: "Pressure Washing", address: "44 Willow St", date: "Today", source: "Website", status: "New", value: 680 },
  { name: "Deck Cleaning Lead", service: "Deck Cleaning", address: "91 Brook Ave", date: "Today", source: "Google", status: "Contacted", value: 420 },
  { name: "Lucas Martin", service: "Window Cleaning", address: "150 Sherbrooke W", date: "Yesterday", source: "Referral", status: "Quote Sent", value: 760 },
  { name: "Nadia Chen", service: "Flower Planting", address: "22 Victoria Ave", date: "May 30", source: "Facebook", status: "Won", value: 940 },
  { name: "Owen Price", service: "Lawn Care", address: "77 Elm Rd", date: "May 29", source: "Direct Call", status: "Lost", value: 280 },
];

const quotes = [
  { client: "Amelia Roberts", number: "Q-1047", service: "Pressure Washing", value: 680, created: "Today", status: "Sent" },
  { client: "Lucas Martin", number: "Q-1046", service: "Window Cleaning", value: 760, created: "Yesterday", status: "Viewed" },
  { client: "North Ridge HOA", number: "Q-1045", service: "Mulch Installation", value: 3180, created: "May 30", status: "Accepted" },
  { client: "Cedar Lane Condos", number: "Q-1044", service: "Seasonal Cleanup", value: 2640, created: "May 28", status: "Accepted" },
  { client: "Olivia Green", number: "Q-1043", service: "Hedge Trimming", value: 520, created: "May 27", status: "Draft" },
];

const invoices = [
  { number: "INV-1042", client: "Jennifer Taylor", due: "Jun 1", amount: 1120, paid: 0, balance: 1120, status: "Pending" },
  { number: "INV-1039", client: "Cedar Lane Condos", due: "May 24", amount: 2640, paid: 1000, balance: 1640, status: "Overdue" },
  { number: "INV-1034", client: "Robert Johnson", due: "Jun 6", amount: 640, paid: 220, balance: 420, status: "Pending" },
  { number: "INV-1031", client: "Sarah Williams", due: "May 29", amount: 520, paid: 520, balance: 0, status: "Paid" },
  { number: "INV-1028", client: "Michael Brown", due: "May 22", amount: 380, paid: 380, balance: 0, status: "Paid" },
];

const monthlyRevenue = [
  { label: "Jan", value: 7200 },
  { label: "Feb", value: 8400 },
  { label: "Mar", value: 9800 },
  { label: "Apr", value: 11800 },
  { label: "May", value: 14300 },
  { label: "Jun", value: 12540 },
];

const serviceRevenue = [
  { label: "Pressure Washing", value: 22500, tone: "blue" as Tone },
  { label: "Window Cleaning", value: 17800, tone: "violet" as Tone },
  { label: "Lawn Care", value: 19800, tone: "emerald" as Tone },
  { label: "Flower Planting", value: 9200, tone: "amber" as Tone },
  { label: "Mulch", value: 14800, tone: "orange" as Tone },
  { label: "Seasonal Cleanup", value: 16400, tone: "stone" as Tone },
];

const neighborhoodRevenue = [
  { area: "Westmount", jobs: 28, revenue: 31200 },
  { area: "Burlington", jobs: 24, revenue: 26800 },
  { area: "Oakville", jobs: 20, revenue: 22400 },
  { area: "Milton", jobs: 17, revenue: 15100 },
  { area: "Montreal", jobs: 32, revenue: 33800 },
];

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

function PageShell({
  active,
  title,
  eyebrow,
  children,
}: {
  active: string;
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <main className="stornway-dashboard min-h-screen overflow-x-hidden bg-[var(--fog)] text-stone-950 lg:pl-[260px]">
      <div className="min-h-screen min-w-0">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] overflow-y-auto border-r border-stone-200 bg-white/95 lg:flex lg:flex-col">
          <div className="border-b border-stone-200 px-5 py-4">
            <a href="/dashboard" className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-none bg-[#102217] text-white">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold">Stornway</span>
                <span className="block text-xs text-stone-500">Landscaping & Washing</span>
              </span>
            </a>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
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
                  {item.count ? (
                    <span className="rounded-none bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      {item.count}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-stone-200 p-4">
            <div className="rounded-none bg-stone-50 p-3">
              <p className="text-sm font-semibold text-stone-950">Next goal</p>
              <p className="mt-1 text-xs text-stone-500">Complete 30 jobs this month</p>
              <div className="mt-3 h-2 rounded-none bg-stone-200">
                <div className="h-2 w-[77%] rounded-none bg-emerald-700" />
              </div>
            </div>
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
              <QuickActions />
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
            <LoadingState />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickActions() {
  const actions = ["Create quote", "Create invoice", "Schedule job", "Add client"];
  return (
    <div className="hidden items-center gap-2 md:flex">
      {actions.slice(0, 2).map((action) => (
        <a
          key={action}
          href={action === "Create invoice" ? "/dashboard/invoices" : "/dashboard/quotes"}
          className="inline-flex items-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          <Plus size={16} aria-hidden="true" />
          {action}
        </a>
      ))}
      <button className="inline-flex items-center gap-2 rounded-none bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
        <Sparkles size={16} aria-hidden="true" />
        Quick Actions
        <ChevronDown size={15} aria-hidden="true" />
      </button>
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

function LoadingState() {
  return (
    <div className="rounded-none border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Loading state</p>
          <p className="mt-1 text-sm text-stone-500">Live data refresh preview. Mock data is shown while integrations sync.</p>
        </div>
        <div className="hidden flex-1 gap-2 md:flex">
          <span className="h-2 flex-1 rounded-none bg-stone-100" />
          <span className="h-2 flex-1 rounded-none bg-stone-100" />
          <span className="h-2 flex-1 rounded-none bg-stone-100" />
        </div>
      </div>
    </div>
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

function RevenueChart({ data = monthlyRevenue }: { data?: typeof monthlyRevenue }) {
  const max = Math.max(...data.map((item) => item.value));
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
  const max = Math.max(...data.map((item) => item.value));
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
  const first = steps[0]?.value ?? 1;
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.label} className="rounded-none border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{step.label}</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{step.value}</p>
          <p className="mt-1 text-xs text-stone-500">{Math.round((step.value / first) * 100)}% of requests</p>
          {index < steps.length - 1 ? <div className="mt-3 h-1 rounded-none bg-emerald-700" /> : null}
        </div>
      ))}
    </div>
  );
}

function HeatMap() {
  const points = [
    ["left-[18%] top-[45%] size-16 bg-red-500/70"],
    ["left-[30%] top-[38%] size-12 bg-orange-400/65"],
    ["left-[46%] top-[50%] size-20 bg-red-500/70"],
    ["left-[60%] top-[42%] size-14 bg-amber-400/70"],
    ["left-[73%] top-[56%] size-12 bg-emerald-400/60"],
    ["left-[38%] top-[64%] size-10 bg-emerald-400/60"],
  ];
  return (
    <div className="p-4">
      <div className="relative h-56 overflow-hidden rounded-none border border-stone-200 bg-[linear-gradient(135deg,#dbeafe_0_22%,#ecfdf5_22%_48%,#fef3c7_48%_64%,#e0f2fe_64%)]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:34px_34px]" />
        {points.map(([classes], index) => (
          <span key={index} className={`absolute rounded-none blur-lg ${classes}`} />
        ))}
        <span className="absolute bottom-3 left-3 rounded-none bg-white/90 px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm">
          Revenue concentration by completed jobs
        </span>
      </div>
    </div>
  );
}

function MapPreview({ title = "Today's Route Preview" }: { title?: string }) {
  return (
    <div className="p-4">
      <div className="relative h-64 overflow-hidden rounded-none border border-stone-200 bg-[linear-gradient(135deg,#eef2ff,#ecfdf5_45%,#e0f2fe)]">
        <div className="absolute inset-x-0 top-1/2 h-3 -rotate-6 bg-white/70" />
        <div className="absolute left-1/4 top-0 h-full w-3 rotate-12 bg-white/70" />
        {jobs.slice(0, 5).map((job, index) => (
          <div
            key={job.client}
            className="absolute flex size-9 items-center justify-center rounded-none bg-emerald-800 text-xs font-semibold text-white shadow-lg"
            style={{ left: `${16 + index * 16}%`, top: `${24 + (index % 3) * 18}%` }}
            title={job.address}
          >
            {index + 1}
          </div>
        ))}
        <div className="absolute bottom-3 left-3 rounded-none bg-white/90 px-3 py-2 shadow-sm">
          <p className="text-sm font-semibold text-stone-950">{title}</p>
          <p className="text-xs text-stone-500">5 stops, 42 min drive, {money.format(5430)} scheduled</p>
        </div>
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

function JobsTable({ compact = false }: { compact?: boolean }) {
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
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {jobs.slice(0, compact ? 4 : jobs.length).map((job) => (
            <tr key={`${job.client}-${job.service}`}>
              <td className="px-4 py-3 font-semibold text-stone-950">{job.client}</td>
              <td className="px-4 py-3 text-stone-600">{job.service}</td>
              <td className="px-4 py-3 text-stone-600">{job.address}</td>
              <td className="px-4 py-3 text-stone-600">{job.date}, {job.time}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(job.status)}>{job.status}</Badge></td>
              <td className="px-4 py-3 text-right font-semibold text-stone-950">{money.format(job.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleWidget() {
  return (
    <div className="space-y-4 p-4">
      {jobs.slice(0, 4).map((job, index) => (
        <div key={`schedule-${job.client}`} className="flex gap-3">
          <div className="w-20 text-sm text-stone-500">{job.time.split(" - ")[0]}</div>
          <div className="relative flex-1 border-l border-stone-200 pl-4">
            <span className={`absolute -left-1.5 top-1 size-3 rounded-none ${index % 2 ? "bg-amber-500" : "bg-emerald-600"}`} />
            <p className="text-sm font-semibold text-stone-950">{job.service}</p>
            <p className="mt-0.5 text-xs text-stone-500">{job.client} - {job.crew}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeDashboardPage() {
  return (
    <PageShell active="Home" eyebrow="Stornway dashboard" title="Good afternoon, Stornway">
      <KpiGrid
        items={[
          { label: "Revenue this month", value: "$12,540", detail: "+23% vs last 30 days", tone: "emerald", icon: BadgeDollarSign },
          { label: "Upcoming jobs", value: "14", detail: "Next 7 days", tone: "blue", icon: CalendarDays },
          { label: "Quotes awaiting response", value: "8", detail: "$4,260 pipeline", tone: "violet", icon: FileText },
          { label: "Outstanding invoices", value: "$3,180", detail: "7 invoices open", tone: "orange", icon: WalletCards },
          { label: "New requests this week", value: "5", detail: "3 from Google", tone: "stone", icon: Inbox },
          { label: "Conversion rate", value: "33%", detail: "Requests to paid jobs", tone: "emerald", icon: TrendingUp },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <Card title="Upcoming Jobs" action="View all"><JobsTable /></Card>
        <div className="space-y-4">
          <Card title="Today's Schedule" action="Open schedule"><ScheduleWidget /></Card>
          <Card title="Quick Actions">
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {["Create quote", "Create invoice", "Schedule job", "Add client"].map((action) => (
                <button key={action} className="inline-flex items-center justify-center gap-2 rounded-none border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100">
                  <Plus size={16} aria-hidden="true" />{action}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Revenue Chart" action="Export"><RevenueChart /></Card>
        <Card title="Lead Conversion Widget"><Funnel steps={[{ label: "Requests", value: 42 }, { label: "Quotes", value: 28 }, { label: "Jobs", value: 18 }, { label: "Paid", value: 14 }]} /></Card>
        <Card title="Revenue Heat Map" action="Open map"><HeatMap /></Card>
      </div>
      <EmptyState label="If no jobs match the active filters, this area explains how to clear filters or create a new job." />
    </PageShell>
  );
}

export function SchedulePage() {
  return (
    <PageShell active="Schedule" eyebrow="Daily operations" title="Schedule">
      <KpiGrid
        items={[
          { label: "Jobs today", value: "6", detail: "4 confirmed, 2 pending", tone: "blue", icon: CalendarDays },
          { label: "Revenue today", value: "$5,430", detail: "Booked route value", tone: "emerald", icon: CircleDollarSign },
          { label: "Hours booked", value: "31.5", detail: "Across 3 crews", tone: "violet", icon: Clock3 },
          { label: "Open time slots", value: "4", detail: "Best fit after 3 PM", tone: "amber", icon: Gauge },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Calendar View" action="Day | Week | Month">
          <div className="grid gap-3 p-4 md:grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="min-h-36 rounded-none border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-semibold uppercase text-stone-400">{day}</p>
                {jobs.filter((_, jobIndex) => jobIndex % 7 === index || (index === 0 && jobIndex < 3)).slice(0, 2).map((job) => (
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
        <Card title="Route Preview"><MapPreview /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <Card title="Scheduled Jobs" action="Dispatch"><JobsTable /></Card>
        <Card title="Filters">
          <div className="grid gap-3 p-4">
            {["Service Type", "Crew", "Status"].map((filter) => (
              <label key={filter} className="grid gap-1 text-sm font-semibold text-stone-700">
                {filter}
                <select className="rounded-none border border-stone-200 bg-white px-3 py-2 text-sm font-normal text-stone-600">
                  <option>All {filter.toLowerCase()}</option>
                  <option>Pressure Washing</option>
                  <option>Landscaping</option>
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

export function ClientsPage() {
  return (
    <PageShell active="Clients" eyebrow="CRM" title="Clients">
      <KpiGrid
        items={[
          { label: "Total clients", value: "486", detail: "Residential and commercial", tone: "stone", icon: Users },
          { label: "Active clients", value: "214", detail: "Serviced in last year", tone: "emerald", icon: CheckCircle2 },
          { label: "New this month", value: "31", detail: "+12% month over month", tone: "blue", icon: Plus },
          { label: "Returning clients", value: "64%", detail: "Repeat booking rate", tone: "violet", icon: TrendingUp },
        ]}
      />
      <Card title="Search + Filters" action="Save view">
        <div className="grid gap-3 p-4 md:grid-cols-4">
          {["Name", "Email", "Phone", "Service type"].map((label) => (
            <input key={label} className="rounded-none border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder={label} />
          ))}
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card title="Clients Table" action="Export">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
                <tr>
                  {["Name", "Address", "Email", "Phone", "Last service", "Lifetime value", "Status"].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((client) => (
                  <tr key={client.email}>
                    <td className="px-4 py-3 font-semibold text-stone-950">{client.name}</td>
                    <td className="px-4 py-3 text-stone-600">{client.address}</td>
                    <td className="px-4 py-3 text-stone-600">{client.email}</td>
                    <td className="px-4 py-3 text-stone-600">{client.phone}</td>
                    <td className="px-4 py-3 text-stone-600">{client.lastService}</td>
                    <td className="px-4 py-3 font-semibold text-stone-950">{money.format(client.lifetime)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(client.status)}>{client.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Client Detail Drawer" action="Open full profile">
          <div className="space-y-4 p-4">
            <div>
              <p className="text-lg font-semibold text-stone-950">Cedar Lane Condos</p>
              <p className="text-sm text-stone-500">Commercial account - seasonal cleanup and snow referral partner</p>
            </div>
            <div className="grid gap-2 text-sm">
              <p className="flex items-center gap-2 text-stone-600"><Mail size={15} /> manager@cedarlane.example</p>
              <p className="flex items-center gap-2 text-stone-600"><Phone size={15} /> (514) 555-0142</p>
              <p className="flex items-center gap-2 text-stone-600"><MapPin size={15} /> 88 Cedar Lane, Westmount</p>
            </div>
            <BarChart data={[{ label: "Service history", value: 9 }, { label: "Quotes", value: 4 }, { label: "Invoices", value: 8 }, { label: "Notes", value: 14 }, { label: "Photos", value: 26 }]} />
            <p className="rounded-none bg-emerald-50 p-3 text-sm text-emerald-800">Revenue generated: {money.format(11950)}. Next reminder: fall cleanup campaign.</p>
          </div>
        </Card>
      </div>
      <EmptyState label="No clients match the current search. Clear filters or add a new client." />
    </PageShell>
  );
}

export function RequestsPage({
  liveRequests = [],
}: {
  liveRequests?: DashboardRequest[];
}) {
  const stages = ["New", "Contacted", "Quote Sent", "Won", "Lost"];
  const allRequests = [...liveRequests, ...mockRequests];
  return (
    <PageShell active="Requests" eyebrow="Lead inbox" title="Requests">
      <KpiGrid
        items={[
          { label: "New requests", value: "12", detail: "5 this week", tone: "blue", icon: Inbox },
          { label: "Contacted", value: "18", detail: "Median response 2h", tone: "amber", icon: Phone },
          { label: "Quoted", value: "27", detail: "$18,400 proposed", tone: "violet", icon: FileText },
          { label: "Lost", value: "6", detail: "Mostly price objections", tone: "red", icon: Bell },
        ]}
      />
      <Card title="Request Pipeline" action="Add request">
        <div className="grid gap-3 p-4 lg:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="rounded-none border border-stone-200 bg-stone-50 p-3">
              <p className="text-sm font-semibold text-stone-950">{stage}</p>
              <div className="mt-3 space-y-2">
                {allRequests.filter((request) => request.status === stage).map((request) => (
                  <div key={request.name} className="rounded-none bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-stone-950">{request.name}</p>
                    <p className="text-xs text-stone-500">{request.service}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">{money.format(request.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card title="Requests Table" action="Export">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
                <tr>{["Name", "Service Requested", "Address", "Date", "Lead Source", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allRequests.map((request) => (
                  <tr key={request.name}>
                    <td className="px-4 py-3 font-semibold">{request.name}</td>
                    <td className="px-4 py-3 text-stone-600">{request.service}</td>
                    <td className="px-4 py-3 text-stone-600">{request.address}</td>
                    <td className="px-4 py-3 text-stone-600">{request.date}</td>
                    <td className="px-4 py-3 text-stone-600">{request.source}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(request.status)}>{request.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Lead Source Breakdown">
          <PieChart title="Lead sources" segments={[
            { label: "Website", value: 42, color: "#3080ff" },
            { label: "Referral", value: 16, color: "#009767" },
            { label: "Google", value: 26, color: "#f99c00" },
            { label: "Facebook", value: 10, color: "#7008e7" },
            { label: "Direct Call", value: 6, color: "#79716b" },
          ]} />
        </Card>
      </div>
      <EmptyState label="No incoming requests in this source or status. New website form submissions will appear here." />
    </PageShell>
  );
}

export function QuotesPage() {
  return (
    <PageShell active="Quotes" eyebrow="Sales pipeline" title="Quotes">
      <KpiGrid
        items={[
          { label: "Draft quotes", value: "19", detail: "$9,450 draft value", tone: "amber", icon: ClipboardList },
          { label: "Sent quotes", value: "8", detail: "$4,260 active", tone: "blue", icon: FileText },
          { label: "Accepted quotes", value: "3", detail: "$6,470 to schedule", tone: "emerald", icon: FileCheck2 },
          { label: "Conversion rate", value: "33%", detail: "+4 points this month", tone: "violet", icon: TrendingUp },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Quote Funnel"><Funnel steps={[{ label: "Requests", value: 42 }, { label: "Quotes Sent", value: 28 }, { label: "Viewed", value: 19 }, { label: "Accepted", value: 9 }]} /></Card>
        <Card title="Revenue Forecast"><RevenueChart data={[{ label: "W1", value: 4100 }, { label: "W2", value: 6800 }, { label: "W3", value: 5400 }, { label: "W4", value: 9200 }, { label: "W5", value: 7200 }, { label: "W6", value: 10400 }]} /></Card>
      </div>
      <Card title="Quotes Table" action="Create quote">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>{["Client", "Quote #", "Service", "Value", "Created", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {quotes.map((quote) => (
                <tr key={quote.number}>
                  <td className="px-4 py-3 font-semibold">{quote.client}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.number}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.service}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(quote.value)}</td>
                  <td className="px-4 py-3 text-stone-600">{quote.created}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(quote.status)}>{quote.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <EmptyState label="No quotes match this status. Use Create quote to start a washing or landscaping estimate." />
    </PageShell>
  );
}

export function JobsPage() {
  return (
    <PageShell active="Jobs" eyebrow="Work management" title="Jobs">
      <KpiGrid
        items={[
          { label: "Active jobs", value: "6", detail: "2 in progress now", tone: "blue", icon: Wrench },
          { label: "Scheduled jobs", value: "14", detail: "Next 7 days", tone: "violet", icon: CalendarDays },
          { label: "Completed jobs", value: "23", detail: "This month", tone: "emerald", icon: CheckCircle2 },
          { label: "Revenue scheduled", value: "$18,920", detail: "Booked work value", tone: "emerald", icon: BadgeDollarSign },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card title="Job Status Breakdown">
          <PieChart title="Job status" segments={[
            { label: "Scheduled", value: 14, color: "#3080ff" },
            { label: "In Progress", value: 6, color: "#f99c00" },
            { label: "Completed", value: 23, color: "#009767" },
            { label: "Delayed", value: 3, color: "#bf000f" },
          ]} />
        </Card>
        <Card title="Map View"><MapPreview title="Upcoming Jobs Map" /></Card>
      </div>
      <Card title="Jobs Table" action="Schedule job">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>{["Client", "Service", "Address", "Date", "Assigned Crew", "Revenue", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {jobs.map((job) => (
                <tr key={`${job.client}-jobs`}>
                  <td className="px-4 py-3 font-semibold">{job.client}</td>
                  <td className="px-4 py-3 text-stone-600">{job.service}</td>
                  <td className="px-4 py-3 text-stone-600">{job.address}</td>
                  <td className="px-4 py-3 text-stone-600">{job.date}</td>
                  <td className="px-4 py-3 text-stone-600">{job.crew}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(job.revenue)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(job.status)}>{job.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <EmptyState label="No jobs in this crew or service filter. Schedule a new job or change filters." />
    </PageShell>
  );
}

export function InvoicesPage() {
  return (
    <PageShell active="Invoices" eyebrow="Payments" title="Invoices">
      <KpiGrid
        items={[
          { label: "Outstanding balance", value: "$3,180", detail: "7 open invoices", tone: "orange", icon: WalletCards },
          { label: "Paid invoices", value: "18", detail: "$6,540 collected", tone: "emerald", icon: CheckCircle2 },
          { label: "Overdue invoices", value: "3", detail: "$1,000 at risk", tone: "red", icon: Bell },
          { label: "Average payment time", value: "5.4d", detail: "Down 1.2 days", tone: "blue", icon: Clock3 },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Accounts Receivable Chart"><RevenueChart data={[{ label: "Jan", value: 6800 }, { label: "Feb", value: 7200 }, { label: "Mar", value: 8400 }, { label: "Apr", value: 9100 }, { label: "May", value: 10600 }, { label: "Jun", value: 6540 }]} /></Card>
        <Card title="Payment Status Breakdown">
          <PieChart title="Payment status" segments={[
            { label: "Paid", value: 18, color: "#009767" },
            { label: "Pending", value: 7, color: "#f99c00" },
            { label: "Overdue", value: 3, color: "#bf000f" },
          ]} />
        </Card>
      </div>
      <Card title="Invoice Table" action="Create invoice">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>{["Invoice #", "Client", "Due Date", "Amount", "Paid", "Balance", "Status"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoices.map((invoice) => (
                <tr key={invoice.number}>
                  <td className="px-4 py-3 font-semibold">{invoice.number}</td>
                  <td className="px-4 py-3 text-stone-600">{invoice.client}</td>
                  <td className="px-4 py-3 text-stone-600">{invoice.due}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(invoice.amount)}</td>
                  <td className="px-4 py-3 text-stone-600">{money.format(invoice.paid)}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(invoice.balance)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <EmptyState label="No invoices match the selected payment status. Create an invoice from a completed job." />
    </PageShell>
  );
}

export function InsightsPage() {
  return (
    <PageShell active="Insights" eyebrow="Business intelligence" title="Insights">
      <KpiGrid
        items={[
          { label: "Repeat customer rate", value: "64%", detail: "+8 points year over year", tone: "emerald", icon: Users },
          { label: "Average customer value", value: "$1,420", detail: "Across active clients", tone: "blue", icon: BadgeDollarSign },
          { label: "Customer lifetime value", value: "$4,860", detail: "Top quartile accounts", tone: "violet", icon: TrendingUp },
          { label: "Forecast next month", value: "$16,800", detail: "Accepted + recurring", tone: "emerald", icon: BarChart3 },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Monthly Revenue"><RevenueChart /></Card>
        <Card title="Revenue by Service"><BarChart data={serviceRevenue} /></Card>
        <Card title="Revenue by Client"><BarChart data={customers.slice(0, 5).map((client) => ({ label: client.name, value: client.lifetime }))} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Revenue Heat Map"><HeatMap /></Card>
        <Card title="Lead Conversion Analytics"><Funnel steps={[{ label: "Requests", value: 128 }, { label: "Quotes", value: 84 }, { label: "Jobs", value: 57 }, { label: "Invoices", value: 49 }]} /></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Geographic Analytics">
          <div className="divide-y divide-stone-100">
            {neighborhoodRevenue.map((area) => (
              <div key={area.area} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-stone-950">{area.area}</p>
                  <p className="text-xs text-stone-500">{area.jobs} completed jobs</p>
                </div>
                <p className="font-semibold text-stone-950">{money.format(area.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Service Analytics"><BarChart data={serviceRevenue} /></Card>
        <Card title="Revenue Forecast">
          <div className="space-y-3 p-4">
            {[
              ["Accepted quotes", 6470],
              ["Recurring customers", 7200],
              ["Historical lift", 3130],
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
