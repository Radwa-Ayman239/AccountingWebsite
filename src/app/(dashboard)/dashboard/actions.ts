"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-adapter";
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

  const supabase = await createClient();

  // Fetch transactions
  const { data: txData } = await supabase
    .from("transactions")
    .select("type, category, amount, payment_status, client_id");

  const transactions = (txData ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));

  // Fetch client count
  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });
  const clientCount = count ?? 0;

  // Fetch workers and attendance from Supabase
  let workers: Worker[] = [];
  let attendanceList: WorkerAttendance[] = [];

  const { data: workersData } = await supabase
    .from("workers")
    .select("*");
  workers = (workersData ?? []) as Worker[];

  if (workers.length > 0) {
    const workerIds = workers.map((w) => w.id);
    const { data: attData } = await supabase
      .from("worker_attendance")
      .select("*")
      .in("worker_id", workerIds);
    attendanceList = (attData ?? []) as WorkerAttendance[];
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
    if (t.payment_status === "overdue") {
      totalOverdue += t.amount;
    } else if (t.payment_status === "pending") {
      totalPending += t.amount;
    }

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

      const gross = (base / 270) * totalHours;
      salaryDue = Math.max(0, gross - totalDeductions - totalAdvances);
    } else {
      salaryDue = Math.max(0, base - totalDeductions - totalAdvances);
    }

    workerSalaries += salaryDue;
  });

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, client:clients(id, name)")
    .eq("type", "expense")
    .order("date", { ascending: false });

  if (error) {
    console.error("[dashboard] Error fetching general transactions:", error.message);
    return [];
  }

  return ((data ?? []) as Transaction[]).filter((t) =>
    !t.client_id ||
    t.client_id === "general" ||
    generalCategories.includes(t.category)
  );
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, client:clients(id, name)")
    .order("date", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[dashboard] Error fetching recent transactions:", error.message);
    return [];
  }

  return (data ?? []) as Transaction[];
}

export async function getMonthlyTrend(): Promise<MonthlyData[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select("date, type, amount")
    .gte("date", startDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("[dashboard] Error fetching monthly trend:", error.message);
    return [];
  }

  const transactions = (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("type", "expense");

  if (error) {
    console.error("[dashboard] Error fetching expense breakdown:", error.message);
    return [];
  }

  const transactions = (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));

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

  const supabase = await createClient();
  const { data: clientsData, error: clientErr } = await supabase
    .from("clients")
    .select("id, name");

  const { data: txData, error: txErr } = await supabase
    .from("transactions")
    .select("client_id, type, amount");

  if (clientErr || txErr) {
    console.error("[dashboard] Error fetching client profitability:", clientErr?.message, txErr?.message);
    return [];
  }

  const clients = clientsData ?? [];
  const transactions = (txData ?? [])
    .filter((t) => t.client_id && t.client_id !== "general")
    .map((t) => ({ client_id: t.client_id!, type: t.type, amount: Number(t.amount) }));

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
