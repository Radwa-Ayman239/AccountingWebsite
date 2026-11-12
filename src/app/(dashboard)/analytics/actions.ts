"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-adapter";
import type { CategoryBreakdown, ClientProfitability, MonthlyData, Transaction } from "@/lib/types";

export type PeriodType = "last30Days" | "last90Days" | "last6Months" | "lastYear" | "allTime";

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  averageTransaction: number;
  transactionCount: number;
  largestTransaction: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  monthlyTrend: MonthlyData[];
  categoryBreakdown: CategoryBreakdown[];
  clientProfitability: ClientProfitability[];
}

export async function getAnalyticsData(period: PeriodType = "last6Months"): Promise<AnalyticsData> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let startDate: string | null = null;
  const now = new Date();

  if (period === "last30Days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString().split("T")[0];
  } else if (period === "last90Days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    startDate = d.toISOString().split("T")[0];
  } else if (period === "last6Months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 6);
    startDate = d.toISOString().split("T")[0];
  } else if (period === "lastYear") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    startDate = d.toISOString().split("T")[0];
  }

  const supabase = await createClient();
  let txQuery = supabase
    .from("transactions")
    .select("id, client_id, date, type, category, amount, client:clients(name)")
    .order("date", { ascending: true });

  if (startDate) {
    txQuery = txQuery.gte("date", startDate);
  }
  const { data, error } = await txQuery;

  if (error) {
    console.error("[analytics] Error fetching transactions:", error.message);
  }

  const txList = (data ?? []) as unknown as Transaction[];

  let totalIncome = 0;
  let totalExpenses = 0;
  let largestTransaction = 0;
  let totalAmountSum = 0;

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
  const categoryMap = new Map<string, number>();
  const clientMap = new Map<string, { name: string; revenue: number; expenses: number }>();

  txList.forEach((tx) => {
    const amt = Number(tx.amount);
    totalAmountSum += amt;
    if (amt > largestTransaction) {
      largestTransaction = amt;
    }

    if (tx.type === "income") {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      const catCurrent = categoryMap.get(tx.category) ?? 0;
      categoryMap.set(tx.category, catCurrent + amt);
    }

    // Monthly
    const month = tx.date.substring(0, 7);
    const mEntry = monthlyMap.get(month) ?? { revenue: 0, expenses: 0 };
    if (tx.type === "income") {
      mEntry.revenue += amt;
    } else {
      mEntry.expenses += amt;
    }
    monthlyMap.set(month, mEntry);

    // Client
    if (tx.client_id) {
      const clientName = tx.client?.name ?? "Unknown";
      const cEntry = clientMap.get(tx.client_id) ?? {
        name: clientName,
        revenue: 0,
        expenses: 0,
      };
      if (tx.type === "income") {
        cEntry.revenue += amt;
      } else {
        cEntry.expenses += amt;
      }
      clientMap.set(tx.client_id, cEntry);
    }
  });

  const transactionCount = txList.length;
  const averageTransaction = transactionCount > 0 ? totalAmountSum / transactionCount : 0;

  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category: category as CategoryBreakdown["category"],
    amount,
  }));

  const clientProfitability = Array.from(clientMap.entries())
    .map(([client_id, val]) => ({
      client_id,
      client_name: val.name,
      revenue: val.revenue,
      expenses: val.expenses,
      profit: val.revenue - val.expenses,
    }))
    .sort((a, b) => b.profit - a.profit);

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netResult: totalIncome - totalExpenses,
      averageTransaction,
      transactionCount,
      largestTransaction,
    },
    monthlyTrend,
    categoryBreakdown,
    clientProfitability,
  };
}
