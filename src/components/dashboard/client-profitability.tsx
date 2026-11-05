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

interface ClientProfitabilityChartProps {
  data: ClientProfitability[];
  currency: string;
}

export function ClientProfitabilityChart({
  data,
  currency,
}: ClientProfitabilityChartProps) {
  const { t, locale, isRTL } = useLocale();

  const formatValue = (value: number) =>
    formatCurrency(
      value,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.clientProfitability}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t.dashboard.noDataYet}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="client_name"
                width={100}
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
                formatter={(value) =>
                  value === "revenue"
                    ? t.dashboard.revenue
                    : value === "expenses"
                    ? t.dashboard.expenses
                    : t.dashboard.profit
                }
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              <Bar
                dataKey="expenses"
                fill="var(--chart-5)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
