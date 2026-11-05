"use client";

import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { Client, Category } from "@/lib/types";

interface TransactionFiltersProps {
  clients: Pick<Client, "id" | "name">[];
  search: string;
  onSearchChange: (val: string) => void;
  type: string;
  onTypeChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  clientId: string;
  onClientIdChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  onReset: () => void;
}

const CATEGORIES: Category[] = [
  "wood",
  "hinges",
  "handles",
  "dish_racks",
  "trolley",
  "trash_basket",
  "pull_out",
  "magic_corner",
  "gas_springs",
  "rent",
  "utilities",
  "maintenance",
  "overhead",
  "other",
];

export function TransactionFilters({
  clients,
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  clientId,
  onClientIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset,
}: TransactionFiltersProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
      {/* Top row: search + client + type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.transactions.searchTransactions}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-9"
          />
        </div>

        {/* Client filter */}
        <Select value={clientId} onValueChange={onClientIdChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.transactions.filterByClient} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.transactions.allClients}</SelectItem>
            <SelectItem value="general">🏢 مصروفات عامة (بدون عميل)</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.transactions.filterByType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.transactions.allTypes}</SelectItem>
            <SelectItem value="income">{t.transactions.income}</SelectItem>
            <SelectItem value="expense">{t.transactions.expense}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Second row: category + status + date range + reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
        {/* Category filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.transactions.filterByCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.transactions.allCategories}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t.transactions.categories[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.transactions.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.transactions.allStatuses}</SelectItem>
            <SelectItem value="paid">{t.transactions.paid}</SelectItem>
            <SelectItem value="pending">{t.transactions.pending}</SelectItem>
            <SelectItem value="overdue">{t.transactions.overdue}</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Date */}
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder={t.transactions.startDate}
        />

        {/* End Date */}
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder={t.transactions.endDate}
        />

        {/* Reset button */}
        <Button variant="outline" onClick={onReset} className="w-full">
          <RotateCcw className="h-4 w-4" />
          {t.common.clearFilters}
        </Button>
      </div>
    </div>
  );
}
