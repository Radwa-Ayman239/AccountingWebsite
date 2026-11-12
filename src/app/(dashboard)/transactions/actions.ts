"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSupabaseActive, shouldUseSupabase } from "@/lib/auth-adapter";
import { localStore } from "@/lib/store";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Transaction, Client, TransactionType, Category, PaymentStatus } from "@/lib/types";

export interface TransactionFilterParams {
  search?: string;
  type?: string;
  category?: string;
  payment_status?: string;
  client_id?: string;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(filters?: TransactionFilterParams): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("transactions")
        .select("*, client:clients(id, name)")
        .order("date", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.payment_status && filters.payment_status !== "all") {
        query = query.eq("payment_status", filters.payment_status);
      }
      if (filters?.client_id && filters.client_id !== "all") {
        query = query.eq("client_id", filters.client_id);
      }
      if (filters?.startDate) {
        query = query.gte("date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("date", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data ?? []) as Transaction[];

      if (filters?.search?.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        results = results.filter(
          (tx) =>
            tx.description?.toLowerCase().includes(searchLower) ||
            tx.client?.name?.toLowerCase().includes(searchLower)
        );
      }

      return results;
    } catch {
      // Fallback to local store
    }
  }

  // Local Store Mode (Shared Company Database)
  let results = await localStore.getTransactions();

  if (filters?.type && filters.type !== "all") {
    results = results.filter((tx) => tx.type === filters.type);
  }
  if (filters?.category && filters.category !== "all") {
    results = results.filter((tx) => tx.category === filters.category);
  }
  if (filters?.payment_status && filters.payment_status !== "all") {
    results = results.filter((tx) => tx.payment_status === filters.payment_status);
  }
  if (filters?.client_id && filters.client_id !== "all") {
    results = results.filter((tx) => tx.client_id === filters.client_id);
  }
  if (filters?.startDate) {
    results = results.filter((tx) => tx.date >= filters.startDate!);
  }
  if (filters?.endDate) {
    results = results.filter((tx) => tx.date <= filters.endDate!);
  }
  if (filters?.search?.trim()) {
    const searchLower = filters.search.toLowerCase().trim();
    results = results.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(searchLower) ||
        tx.client?.name?.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

export async function getClientsForSelect(): Promise<Pick<Client, "id" | "name">[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error && data) return data;
    } catch {
      // Fallback to local store
    }
  }

  const clients = await localStore.getClients();
  return clients
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Any authenticated user (Admin or Viewer/Worker) CAN create transactions
export async function createTransactionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const client_id = (formData.get("client_id") as string)?.trim() || "general";
  const date = formData.get("date") as string;
  const type = formData.get("type") as TransactionType;
  const category = formData.get("category") as Category;
  const description = (formData.get("description") as string) || "";
  const amountStr = formData.get("amount") as string;
  const payment_status = (formData.get("payment_status") as PaymentStatus) || "pending";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }
  if (!date) {
    return { error: "Date is required" };
  }

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        client_id: client_id === "general" ? null : client_id,
        date,
        type,
        category,
        description: description.trim(),
        amount,
        payment_status,
      });
      if (!error) {
        revalidatePath("/transactions");
        revalidatePath("/clients");
        revalidatePath("/workers");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");
        revalidatePath("/", "layout");
        return { success: true };
      }
    } catch {
      // Fallback to local store
    }
  }

  await localStore.createTransaction({
    user_id: user.id,
    client_id,
    date,
    type,
    category,
    description: description.trim(),
    amount,
    payment_status,
  });

  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/", "layout");
  return { success: true };
}

// ONLY Admin can update existing transactions
export async function updateTransactionAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.isAdmin) {
    return { error: "403: غير مصرح لك بتعديل المعاملات المسجلة - متاح للمسؤول فقط (Only Admins can edit transactions)" };
  }

  const client_id = (formData.get("client_id") as string)?.trim() || "general";
  const date = formData.get("date") as string;
  const type = formData.get("type") as TransactionType;
  const category = formData.get("category") as Category;
  const description = (formData.get("description") as string) || "";
  const amountStr = formData.get("amount") as string;
  const payment_status = (formData.get("payment_status") as PaymentStatus) || "pending";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("transactions")
        .update({
          client_id: client_id === "general" ? null : client_id,
          date,
          type,
          category,
          description: description.trim(),
          amount,
          payment_status,
        })
        .eq("id", id);
      if (!error) {
        revalidatePath("/transactions");
        revalidatePath("/clients");
        revalidatePath("/workers");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");
        revalidatePath("/", "layout");
        return { success: true };
      }
    } catch {
      // Fallback to local store
    }
  }

  await localStore.updateTransaction(id, user.id, {
    client_id,
    date,
    type,
    category,
    description: description.trim(),
    amount,
    payment_status,
  });

  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/", "layout");
  return { success: true };
}

// ONLY Admin can delete transactions
export async function deleteTransactionAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.isAdmin) {
    return { error: "403: غير مصرح لك بحذف المعاملات - متاح للمسؤول فقط (Only Admins can delete transactions)" };
  }

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (!error) {
        revalidatePath("/transactions");
        revalidatePath("/clients");
        revalidatePath("/workers");
        revalidatePath("/dashboard");
        revalidatePath("/analytics");
        revalidatePath("/", "layout");
        return { success: true };
      }
    } catch {
      // Fallback to local store
    }
  }

  await localStore.deleteTransaction(id, user.id);

  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/", "layout");
  return { success: true };
}
