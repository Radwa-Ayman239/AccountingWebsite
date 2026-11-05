"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatMonth } from "@/lib/format";
import type { MonthlyData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyChartProps {
  data: MonthlyData[];
  currency: string;
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  const { t, locale, isRTL } = useLocale();

  const chartData = data.map((d) => ({
    ...d,
    monthLabel: formatMonth(d.month, locale),
  }));

  const formatValue = (value: number) =>
    formatCurrency(
      value,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.monthlyTrends}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t.dashboard.noDataYet}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="monthLabel"
                className="text-xs"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                reversed={isRTL}
              />
              <YAxis
                className="text-xs"
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
                formatter={(value) =>
                  value === "revenue" ? t.dashboard.revenue : t.dashboard.expenses
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--chart-5)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
