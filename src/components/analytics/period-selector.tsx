"use client";

import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import type { PeriodType } from "@/app/(dashboard)/analytics/actions";

interface PeriodSelectorProps {
  selected: PeriodType;
  onChange: (period: PeriodType) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  const { t } = useLocale();

  const periods: { key: PeriodType; label: string }[] = [
    { key: "last30Days", label: t.analytics.last30Days },
    { key: "last90Days", label: t.analytics.last90Days },
    { key: "last6Months", label: t.analytics.last6Months },
    { key: "lastYear", label: t.analytics.lastYear },
    { key: "allTime", label: t.analytics.allTime },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-card p-1 shadow-sm">
      {periods.map((item) => (
        <Button
          key={item.key}
          variant={selected === item.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(item.key)}
          className="text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
