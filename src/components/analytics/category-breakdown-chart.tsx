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

interface CategoryBreakdownChartProps {
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

export function CategoryBreakdownChart({
  data,
  currency,
}: CategoryBreakdownChartProps) {
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
        <CardTitle>{t.analytics.expensesByCategory}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[320px] items-center justify-center text-muted-foreground">
            {t.common.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={105}
                innerRadius={55}
                paddingAngle={3}
                label={({ label, percent }) =>
                  `${label} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cat-cell-${index}`}
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
