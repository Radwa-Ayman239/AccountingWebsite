"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AnalyticsSummary } from "@/app/(dashboard)/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Scale, ArrowUpRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  currency: string;
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  const { t, locale } = useLocale();

  const formatAmount = (amt: number) =>
    formatCurrency(
      amt,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  const cards = [
    {
      title: `${t.analytics.totalIncome} (L.E)`,
      value: formatAmount(summary.totalIncome),
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: `${t.analytics.totalExpenses} (L.E)`,
      value: formatAmount(summary.totalExpenses),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: `${t.analytics.netResult} (L.E)`,
      value: formatAmount(summary.netResult),
      icon: Wallet,
      color: summary.netResult >= 0 ? "text-primary" : "text-destructive",
      bg: summary.netResult >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
    {
      title: `${t.analytics.averageTransaction} (L.E)`,
      value: formatAmount(summary.averageTransaction),
      icon: Scale,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: `${t.analytics.largestTransaction} (L.E)`,
      value: formatAmount(summary.largestTransaction),
      icon: ArrowUpRight,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: t.analytics.transactionVolume,
      value: formatNumber(summary.transactionCount, locale),
      icon: Hash,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground line-clamp-1">
                {c.title}
              </CardTitle>
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-md shrink-0", c.bg)}>
                <Icon className={cn("h-3.5 w-3.5", c.color)} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold truncate">{c.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
