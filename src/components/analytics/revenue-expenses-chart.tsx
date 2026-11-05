"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatMonth } from "@/lib/format";
import type { MonthlyData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueExpensesChartProps {
  data: MonthlyData[];
  currency: string;
}

export function RevenueExpensesChart({
  data,
  currency,
}: RevenueExpensesChartProps) {
  const { t, locale, isRTL } = useLocale();

  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month, locale),
    profit: d.revenue - d.expenses,
  }));

  const formatValue = (value: number) =>
    formatCurrency(
      value,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t.analytics.revenueVsExpenses}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-muted-foreground">
            {t.common.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                reversed={isRTL}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatValue(value),
                  name === "revenue" ? t.dashboard.revenue : t.dashboard.expenses,
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontFamily: "Cairo, sans-serif",
                }}
              />
              <Legend
                formatter={(val) =>
                  val === "revenue" ? t.dashboard.revenue : t.dashboard.expenses
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--chart-5)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
