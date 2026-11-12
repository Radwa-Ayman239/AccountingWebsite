"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-adapter";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Client, ProjectStatus } from "@/lib/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function getClients(): Promise<Client[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: clients, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientError) {
    console.error("[clients] Error fetching clients:", clientError.message);
    return [];
  }
  if (!clients) return [];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("client_id, type, amount, payment_status");

  const txMap = new Map<
    string,
    {
      expenses: number;
      revenue: number;
      pending: number;
      overdue: number;
    }
  >();

  const createDefaultSummary = () => ({
    expenses: 0,
    revenue: 0,
    pending: 0,
    overdue: 0,
  });

  (transactions ?? []).forEach((t) => {
    if (!t.client_id || t.client_id === "general") return;
    const entry = txMap.get(t.client_id) ?? createDefaultSummary();
    const amt = Number(t.amount) || 0;

    if (t.payment_status === "paid") {
      if (t.type === "income") {
        entry.revenue += amt;
      } else if (t.type === "expense") {
        entry.expenses += amt;
      }
    }

    if (t.payment_status === "pending") {
      entry.pending += amt;
    } else if (t.payment_status === "overdue") {
      entry.overdue += amt;
    }

    txMap.set(t.client_id, entry);
  });

  return clients.map((c) => {
    const summary = txMap.get(c.id) ?? createDefaultSummary();
    const profit = summary.revenue - summary.expenses;
    return {
      ...c,
      expenses: summary.expenses,
      revenue: summary.revenue,
      pending: summary.pending,
      overdue: summary.overdue,
      profit: profit,
      net_profit: profit,
      total_invoiced: summary.revenue,
      total_expenses: summary.expenses,
    };
  });
}

export async function createClientAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (!user.isAdmin) {
      return { error: "403: غير مصرح لك بإضافة عملاء - مطلوب صلاحيات مسؤول (Admin privileges required)" };
    }

    const name = formData.get("name") as string;
    const contact_info = formData.get("contact_info") as string;
    const project_status = (formData.get("project_status") as ProjectStatus) || "active";
    const notes = formData.get("notes") as string;

    if (!name?.trim()) {
      return { error: "Name is required" };
    }

    // Log Supabase configuration
    const { url } = getSupabaseEnv();
    console.log("[createClient] Supabase URL:", url);
    console.log("[createClient] User ID:", user.id);
    console.log("[createClient] Creating client:", name);

    const supabase = await createClient();
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name: name.trim(),
      contact_info: contact_info?.trim() ?? "",
      project_status,
      notes: notes?.trim() ?? "",
    });

    if (error) {
      console.error("[createClient] Error:", error.message);
      console.error("[createClient] Error details:", JSON.stringify(error));
      return { error: error.message };
    }

    console.log("[createClient] Success");
    revalidatePath("/clients");
    revalidatePath("/transactions");
    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("[createClient] Unexpected error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateClientAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.isAdmin) {
    return { error: "403: غير مصرح لك بتعديل العميل - مطلوب صلاحيات مسؤول (Admin privileges required)" };
  }

  const name = formData.get("name") as string;
  const contact_info = formData.get("contact_info") as string;
  const project_status = (formData.get("project_status") as ProjectStatus) || "active";
  const notes = formData.get("notes") as string;

  if (!name?.trim()) {
    return { error: "Name is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name: name.trim(),
      contact_info: contact_info?.trim() ?? "",
      project_status,
      notes: notes?.trim() ?? "",
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  revalidatePath("/transactions");
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteClientAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.isAdmin) {
    return { error: "403: غير مصرح لك بحذف العميل - مطلوب صلاحيات مسؤول (Admin privileges required)" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  revalidatePath("/transactions");
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/", "layout");
  return { success: true };
}
