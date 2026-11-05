"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  getAnalyticsData,
  type AnalyticsData,
  type PeriodType,
} from "@/app/(dashboard)/analytics/actions";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { RevenueExpensesChart } from "@/components/analytics/revenue-expenses-chart";
import { CategoryBreakdownChart } from "@/components/analytics/category-breakdown-chart";
import { ClientBreakdownChart } from "@/components/analytics/client-breakdown-chart";
import { Loader2 } from "lucide-react";

interface AnalyticsContentProps {
  initialData: AnalyticsData;
  currency: string;
}

export function AnalyticsContent({
  initialData,
  currency,
}: AnalyticsContentProps) {
  const { t } = useLocale();
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [period, setPeriod] = useState<PeriodType>("last6Months");
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    startTransition(async () => {
      const updated = await getAnalyticsData(newPeriod);
      setData(updated);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.analytics.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.financialOverview}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <PeriodSelector selected={period} onChange={handlePeriodChange} />
        </div>
      </div>

      <SummaryCards summary={data.summary} currency={currency} />

      <div className="grid gap-6">
        <RevenueExpensesChart data={data.monthlyTrend} currency={currency} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdownChart
          data={data.categoryBreakdown}
          currency={currency}
        />
        <ClientBreakdownChart
          data={data.clientProfitability}
          currency={currency}
        />
      </div>
    </div>
  );
}
