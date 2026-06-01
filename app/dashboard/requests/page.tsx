import {
  type DashboardRequest,
  RequestsPage,
} from "@/components/ops-dashboard";
import { getQuoteRequests } from "@/lib/quote-requests";
import type { ContactServiceId } from "@/lib/contact-services";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<ContactServiceId, string> = {
  landscaping: "Landscaping",
  "pressure-washing": "Pressure Washing",
  "window-washing": "Window Cleaning",
  general: "General Inquiry",
};

function formatServices(services: ContactServiceId[]) {
  if (services.length === 0) return "General Inquiry";
  return services.map((service) => SERVICE_LABELS[service]).join(", ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function Page() {
  let liveRequests: DashboardRequest[] = [];

  try {
    const quoteRequests = await getQuoteRequests();
    liveRequests = quoteRequests.map((request) => ({
      name: request.name,
      service: formatServices(request.services),
      address: "Address to confirm",
      date: formatDate(request.created_at),
      source: "Website",
      status: request.email_sent ? "Contacted" : "New",
      value: request.services.includes("landscaping") ? 950 : 640,
    }));
  } catch (error) {
    console.error("[dashboard/requests] Failed to load Supabase requests:", error);
  }

  return <RequestsPage liveRequests={liveRequests} useMockFallback={false} />;
}
