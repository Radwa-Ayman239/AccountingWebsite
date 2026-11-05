"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface RecentTransactionsListProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactionsList({
  transactions,
  currency,
}: RecentTransactionsListProps) {
  const { t, locale } = useLocale();

  const formatAmount = (amount: number) =>
    formatCurrency(
      amount,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.recentTransactions} (L.E)</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t.dashboard.noDataYet}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {tx.client?.name ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateShort(tx.date, locale)}
                    {tx.description && ` · ${tx.description}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={tx.type === "income" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {tx.type === "income"
                      ? t.transactions.income
                      : t.transactions.expense}
                  </Badge>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === "income" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(Number(tx.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/transactions" className="w-full">
          <Button variant="outline" className="w-full">
            {t.dashboard.viewAllTransactions}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
