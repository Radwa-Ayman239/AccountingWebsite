"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import type { ClientProfitability } from "@/lib/types";
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

interface ClientBreakdownChartProps {
  data: ClientProfitability[];
  currency: string;
}

export function ClientBreakdownChart({
  data,
  currency,
}: ClientBreakdownChartProps) {
  const { t, locale, isRTL } = useLocale();

  const formatValue = (value: number) =>
    formatCurrency(
      value,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  const top10 = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.analytics.perClientBreakdown}</CardTitle>
      </CardHeader>
      <CardContent>
        {top10.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-muted-foreground">
            {t.common.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={top10}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="client_name"
                width={110}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                orientation={isRTL ? "right" : "left"}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatValue(value),
                  name === "revenue"
                    ? t.dashboard.revenue
                    : name === "expenses"
                    ? t.dashboard.expenses
                    : t.dashboard.profit,
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
                  val === "revenue"
                    ? t.dashboard.revenue
                    : val === "expenses"
                    ? t.dashboard.expenses
                    : t.dashboard.profit
                }
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="expenses" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="profit" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
