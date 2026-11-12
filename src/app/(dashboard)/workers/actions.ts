"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-adapter";
import { calculateWorkedHours } from "@/lib/format";
import type { Worker, WorkerAttendance } from "@/lib/types";

// Arabic day names map
const ARABIC_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export async function getWorkersAction(): Promise<Worker[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[workers] Error fetching workers:", error.message);
    return [];
  }

  return (data ?? []) as Worker[];
}

export async function createWorkerAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const job_title = (formData.get("job_title") as string)?.trim();
  const monthly_salary = Number(formData.get("monthly_salary")) || 0;
  const phone = (formData.get("phone") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();

  if (!name) {
    return { error: "اسم العامل مطلوب (Worker name is required)" };
  }

  const supabase = await createClient();
  const { data: newWorker, error } = await supabase
    .from("workers")
    .insert({
      user_id: user.id,
      name,
      job_title: job_title || "",
      monthly_salary,
      phone: phone || "",
      notes: notes || "",
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/", "layout");
  return { worker: newWorker };
}

export async function updateWorkerAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const job_title = (formData.get("job_title") as string)?.trim();
  const monthly_salary = Number(formData.get("monthly_salary")) || 0;
  const phone = (formData.get("phone") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim();

  if (!name) {
    return { error: "اسم العامل مطلوب" };
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("workers")
    .update({
      name,
      job_title: job_title || "",
      monthly_salary,
      phone: phone || "",
      notes: notes || "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/", "layout");
  return { worker: updated };
}

export async function deleteWorkerAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("workers")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/clients");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getWorkerAttendanceAction(workerId?: string): Promise<WorkerAttendance[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  let query = supabase
    .from("worker_attendance")
    .select("*")
    .order("date", { ascending: false });

  if (workerId) {
    query = query.eq("worker_id", workerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[workers] Error fetching attendance:", error.message);
    return [];
  }

  return (data ?? []) as WorkerAttendance[];
}

export async function createWorkerAttendanceAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const worker_id = formData.get("worker_id") as string;
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const check_in_time = (formData.get("check_in_time") as string)?.trim() || "08:00 ص";
  const departure_time = (formData.get("departure_time") as string)?.trim() || "05:00 م";
  
  // Calculate daily hours or read from form
  const rawHours = formData.get("daily_hours");
  const daily_hours = rawHours && !isNaN(Number(rawHours)) && Number(rawHours) > 0
    ? Number(rawHours)
    : calculateWorkedHours(check_in_time, departure_time);

  const delay = (formData.get("delay") as string)?.trim() || "لا يوجد";
  const deduction = Number(formData.get("deduction")) || 0;
  const advances = Number(formData.get("advances")) || 0;
  const notes = (formData.get("notes") as string)?.trim() || "";

  if (!worker_id) {
    return { error: "يجب اختيار العامل" };
  }

  // Auto-calculate day name in Arabic from the date
  const dateObj = new Date(date);
  const dayName = isNaN(dateObj.getTime())
    ? "اليوم"
    : ARABIC_DAYS[dateObj.getDay()];

  const supabase = await createClient();
  const { data: newRecord, error } = await supabase
    .from("worker_attendance")
    .insert({
      worker_id,
      date,
      day: dayName,
      check_in_time,
      departure_time,
      daily_hours,
      delay,
      deduction,
      advances,
      notes,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/", "layout");
  return { record: newRecord };
}

export async function updateWorkerAttendanceAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const date = formData.get("date") as string;
  const check_in_time = (formData.get("check_in_time") as string)?.trim();
  const departure_time = (formData.get("departure_time") as string)?.trim();
  
  const rawHours = formData.get("daily_hours");
  const daily_hours = rawHours && !isNaN(Number(rawHours)) && Number(rawHours) > 0
    ? Number(rawHours)
    : calculateWorkedHours(check_in_time, departure_time);

  const delay = (formData.get("delay") as string)?.trim();
  const deduction = Number(formData.get("deduction")) || 0;
  const advances = Number(formData.get("advances")) || 0;
  const notes = (formData.get("notes") as string)?.trim();

  const dateObj = new Date(date);
  const dayName = isNaN(dateObj.getTime())
    ? undefined
    : ARABIC_DAYS[dateObj.getDay()];

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("worker_attendance")
    .update({
      date,
      ...(dayName ? { day: dayName } : {}),
      check_in_time,
      departure_time,
      daily_hours,
      delay,
      deduction,
      advances,
      notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/", "layout");
  return { record: updated };
}

export async function deleteWorkerAttendanceAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("worker_attendance")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/workers");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/", "layout");
  return { success: true };
}
