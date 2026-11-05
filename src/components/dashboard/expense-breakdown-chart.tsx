"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import type { CategoryBreakdown } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ExpenseBreakdownChartProps {
  data: CategoryBreakdown[];
  currency: string;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--destructive)",
];

export function ExpenseBreakdownChart({
  data,
  currency,
}: ExpenseBreakdownChartProps) {
  const { t, locale } = useLocale();

  const getCategoryLabel = (category: string) => {
    const key = category as keyof typeof t.transactions.categories;
    return t.transactions.categories[key] ?? category;
  };

  const chartData = data.map((d) => ({
    ...d,
    label: getCategoryLabel(d.category),
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
        <CardTitle>{t.dashboard.expenseBreakdown}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            {t.dashboard.noDataYet}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                label={({ label, percent }) =>
                  `${label} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatValue(value)}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontFamily: "Cairo, sans-serif",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
