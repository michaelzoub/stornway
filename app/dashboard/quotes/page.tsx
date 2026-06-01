import { QuotesPage } from "@/components/ops-dashboard";
import { getDashboardQuotes } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveQuotes = await getDashboardQuotes();
  return <QuotesPage liveQuotes={liveQuotes} />;
}
