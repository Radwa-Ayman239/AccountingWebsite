"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSupabaseActive } from "@/lib/auth-adapter";
import { localStore } from "@/lib/store";
import { calculateWorkedHours } from "@/lib/format";
import type {
  DashboardMetrics,
  MonthlyData,
  CategoryBreakdown,
  ClientProfitability,
  Transaction,
  Worker,
  WorkerAttendance,
} from "@/lib/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let transactions: { type: string; category: string; amount: number; payment_status: string; client_id?: string }[] = [];
  let clientCount = 0;
  let workers: Worker[] = [];
  let attendanceList: WorkerAttendance[] = [];

  if (isSupabaseActive()) {
    const supabase = await createClient();
    const { data: txData } = await supabase
      .from("transactions")
      .select("type, category, amount, payment_status, client_id");
    transactions = (txData ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));

    const { count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });
    clientCount = count ?? 0;

    // Workers from local store fallback
    workers = await localStore.getWorkers();
    attendanceList = await localStore.getWorkerAttendance();
  } else {
    const txData = await localStore.getTransactions();
    transactions = txData.map((t) => ({
      type: t.type,
      category: t.category,
      amount: Number(t.amount),
      payment_status: t.payment_status,
      client_id: t.client_id,
    }));
    const clients = await localStore.getClients();
    clientCount = clients.length;

    workers = await localStore.getWorkers();
    attendanceList = await localStore.getWorkerAttendance();
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  let clientExpenses = 0;
  let generalExpenses = 0;
  let totalOverhead = 0;
  let totalOverdue = 0;
  let totalPending = 0;

  const generalCategories = ["rent", "utilities", "maintenance", "overhead"];

  transactions.forEach((t) => {
    // Total Overdue and Pending
    if (t.payment_status === "overdue") {
      totalOverdue += t.amount;
    } else if (t.payment_status === "pending") {
      totalPending += t.amount;
    }

    // Revenue and Expenses counted when confirmed (paid)
    if (t.payment_status === "paid") {
      if (t.type === "income") {
        totalRevenue += t.amount;
      } else if (t.type === "expense") {
        totalExpenses += t.amount;
        
        const isGeneral =
          !t.client_id ||
          t.client_id === "general" ||
          generalCategories.includes(t.category);

        if (isGeneral) {
          generalExpenses += t.amount;
          totalOverhead += t.amount;
        } else {
          clientExpenses += t.amount;
        }
      }
    }
  });

  // Calculate worker salaries according to 270 hours formula
  let workerSalaries = 0;
  workers.forEach((w) => {
    const recs = attendanceList.filter((a) => a.worker_id === w.id);
    const totalDeductions = recs.reduce((sum, r) => sum + (Number(r.deduction) || 0), 0);
    const totalAdvances = recs.reduce((sum, r) => sum + (Number(r.advances) || 0), 0);
    const base = Number(w.monthly_salary) || 0;

    let salaryDue = 0;
    if (recs.length > 0) {
      const totalHours = recs.reduce((sum, r) => {
        const h = r.daily_hours !== undefined && !isNaN(Number(r.daily_hours))
          ? Number(r.daily_hours)
          : calculateWorkedHours(r.check_in_time, r.departure_time);
        return sum + h;
      }, 0);

      // (monthly salary / 270) * total hours spent at work
      const gross = (base / 270) * totalHours;
      salaryDue = Math.max(0, gross - totalDeductions - totalAdvances);
    } else {
      salaryDue = Math.max(0, base - totalDeductions - totalAdvances);
    }

    workerSalaries += salaryDue;
  });

  // Actual budget in cash = All actual income - (Client expenses + General expenses + Worker salaries)
  const actualBudget = totalRevenue - (clientExpenses + generalExpenses + workerSalaries);

  return {
    totalRevenue,
    totalExpenses,
    clientExpenses,
    generalExpenses,
    workerSalaries,
    actualBudget,
    totalOverhead,
    netProfit: totalRevenue - totalExpenses,
    totalOverdue,
    totalPending,
    clientCount,
    transactionCount: transactions.length,
  };
}

export async function getGeneralTransactions(): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const generalCategories = ["rent", "utilities", "maintenance", "overhead"];
  const all = await localStore.getTransactions();

  return all.filter((t) => {
    return (
      t.type === "expense" &&
      (!t.client_id ||
        t.client_id === "general" ||
        generalCategories.includes(t.category))
    );
  });
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (isSupabaseActive()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("transactions")
      .select("*, client:clients(id, name)")
      .order("date", { ascending: false })
      .limit(5);

    return (data ?? []) as Transaction[];
  }

  const all = await localStore.getTransactions();
  return all.slice(0, 5);
}

export async function getMonthlyTrend(): Promise<MonthlyData[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let transactions: { date: string; type: string; amount: number }[] = [];

  if (isSupabaseActive()) {
    const supabase = await createClient();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    const { data } = await supabase
      .from("transactions")
      .select("date, type, amount")
      .gte("date", startDate)
      .order("date", { ascending: true });

    transactions = (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));
  } else {
    const all = await localStore.getTransactions();
    transactions = all.map((t) => ({ date: t.date, type: t.type, amount: Number(t.amount) }));
  }

  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

  transactions.forEach((t) => {
    const month = t.date.substring(0, 7);
    const entry = monthlyMap.get(month) ?? { revenue: 0, expenses: 0 };
    if (t.type === "income") {
      entry.revenue += t.amount;
    } else {
      entry.expenses += t.amount;
    }
    monthlyMap.set(month, entry);
  });

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export async function getExpenseBreakdown(): Promise<CategoryBreakdown[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let transactions: { category: string; amount: number }[] = [];

  if (isSupabaseActive()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("transactions")
      .select("category, amount")
      .eq("type", "expense");
    transactions = (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));
  } else {
    const all = await localStore.getTransactions();
    transactions = all
      .filter((t) => t.type === "expense")
      .map((t) => ({ category: t.category, amount: Number(t.amount) }));
  }

  const categoryMap = new Map<string, number>();

  transactions.forEach((t) => {
    const current = categoryMap.get(t.category) ?? 0;
    categoryMap.set(t.category, current + t.amount);
  });

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category: category as CategoryBreakdown["category"],
    amount,
  }));
}

export async function getClientProfitability(): Promise<ClientProfitability[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let clients: { id: string; name: string }[] = [];
  let transactions: { client_id: string; type: string; amount: number }[] = [];

  if (isSupabaseActive()) {
    const supabase = await createClient();
    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, name");
    clients = clientsData ?? [];

    const { data: txData } = await supabase
      .from("transactions")
      .select("client_id, type, amount");
    transactions = (txData ?? [])
      .filter((t) => t.client_id && t.client_id !== "general")
      .map((t) => ({ client_id: t.client_id!, type: t.type, amount: Number(t.amount) }));
  } else {
    const clientsData = await localStore.getClients();
    clients = clientsData.map((c) => ({ id: c.id, name: c.name }));
    const txData = await localStore.getTransactions();
    transactions = txData
      .filter((t) => t.client_id && t.client_id !== "general")
      .map((t) => ({ client_id: t.client_id!, type: t.type, amount: Number(t.amount) }));
  }

  if (clients.length === 0) return [];

  const clientMap = new Map<
    string,
    { name: string; revenue: number; expenses: number }
  >();

  clients.forEach((c) => {
    clientMap.set(c.id, { name: c.name, revenue: 0, expenses: 0 });
  });

  transactions.forEach((t) => {
    const client = clientMap.get(t.client_id);
    if (client) {
      if (t.type === "income") {
        client.revenue += t.amount;
      } else {
        client.expenses += t.amount;
      }
    }
  });

  return Array.from(clientMap.entries())
    .map(([id, data]) => ({
      client_id: id,
      client_name: data.name,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);
}
