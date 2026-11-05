"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  AlertCircle,
  Building2,
  HardHat,
  Banknote,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  currency: string;
}

export function MetricsCards({ metrics, currency }: MetricsCardsProps) {
  const { t, locale } = useLocale();

  const cards = [
    {
      title: "إجمالي الإيرادات الفعلية (L.E)",
      subtitle: "المبالغ المحصلة المؤكدة من العملاء",
      value: metrics.totalRevenue,
      icon: TrendingUp,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
    },
    {
      title: "مصروفات العملاء والخامات (L.E)",
      subtitle: "خشب، مفصلات، مقابض، توريدات",
      value: metrics.clientExpenses,
      icon: Boxes,
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/20",
    },
    {
      title: "المصروفات العامة (L.E)",
      subtitle: "إيجار، كهرباء، مرافق، صيانة، نفقات",
      value: metrics.generalExpenses,
      icon: Building2,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-500/10",
      borderClass: "border-rose-500/20",
    },
    {
      title: "رواتب ومستحقات العمال (L.E)",
      subtitle: "محسوبة على أساس 270 ساعة شهرياً",
      value: metrics.workerSalaries,
      icon: HardHat,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/20",
    },
    {
      title: "الرصيد الفعلي في الخزينة / الميزانية (L.E)",
      subtitle: "الإيرادات - (مصروفات العملاء + العامة + الرواتب)",
      value: metrics.actualBudget,
      icon: Banknote,
      colorClass: metrics.actualBudget >= 0 ? "text-primary" : "text-destructive",
      bgClass: metrics.actualBudget >= 0 ? "bg-primary/10" : "bg-destructive/10",
      borderClass: metrics.actualBudget >= 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-destructive/40",
      isPrimary: true,
    },
    {
      title: "إجمالي المبالغ المعلقة (L.E)",
      subtitle: "مستحقات قيد التحصيل",
      value: metrics.totalPending,
      icon: Clock,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      borderClass: "border-border",
    },
    {
      title: "إجمالي المبالغ المتأخرة (L.E)",
      subtitle: "متأخرات مطلوب متابعتها",
      value: metrics.totalOverdue,
      icon: AlertCircle,
      colorClass: "text-red-600",
      bgClass: "bg-red-600/10",
      borderClass: "border-border",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={cn(
              "transition-all shadow-sm hover:shadow-md",
              card.borderClass,
              card.isPrimary && "sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-card to-accent/20"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-col">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {card.title}
                </CardTitle>
                {card.subtitle && (
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {card.subtitle}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ms-2",
                  card.bgClass
                )}
              >
                <Icon className={cn("h-5 w-5", card.colorClass)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold tracking-tight", card.colorClass)}>
                {card.value < 0 ? "-" : ""}
                {formatCurrency(
                  Math.abs(card.value),
                  currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
                  locale
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
