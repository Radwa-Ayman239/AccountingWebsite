import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-adapter";
import {
  getDashboardMetrics,
  getRecentTransactions,
  getMonthlyTrend,
  getExpenseBreakdown,
  getClientProfitability,
  getGeneralTransactions,
} from "./actions";
import { getUserSettings } from "../settings/actions";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();
  const currency = settings?.currency ?? "EGP";

  const [
    metrics,
    recentTransactions,
    monthlyTrend,
    expenseBreakdown,
    clientProfitability,
    generalTransactions,
  ] = await Promise.all([
    getDashboardMetrics(),
    getRecentTransactions(),
    getMonthlyTrend(),
    getExpenseBreakdown(),
    getClientProfitability(),
    getGeneralTransactions(),
  ]);

  return (
    <DashboardContent
      metrics={metrics}
      recentTransactions={recentTransactions}
      monthlyTrend={monthlyTrend}
      expenseBreakdown={expenseBreakdown}
      clientProfitability={clientProfitability}
      generalTransactions={generalTransactions}
      currency={currency}
    />
  );
}
