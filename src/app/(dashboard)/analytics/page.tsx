import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-adapter";
import { getAnalyticsData } from "./actions";
import { getUserSettings } from "../settings/actions";
import { AnalyticsContent } from "./analytics-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();
  const currency = settings?.currency ?? "EGP";
  const initialData = await getAnalyticsData("last6Months");

  return <AnalyticsContent initialData={initialData} currency={currency} />;
}
