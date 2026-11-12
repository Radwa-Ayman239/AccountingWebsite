"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { localStore } from "@/lib/store";
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
  try {
    return await localStore.getWorkers();
  } catch {
    console.warn("[workers] Failed to read workers from local store");
    return [];
  }
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

  try {
    const newWorker = await localStore.createWorker({
      name,
      job_title: job_title || "",
      monthly_salary,
      phone: phone || "",
      notes: notes || "",
    });

    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/clients");
    revalidatePath("/", "layout");
    return { worker: newWorker };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل إضافة العامل";
    return { error: message };
  }
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

  try {
    const updated = await localStore.updateWorker(id, {
      name,
      job_title: job_title || "",
      monthly_salary,
      phone: phone || "",
      notes: notes || "",
    });

    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/clients");
    revalidatePath("/", "layout");
    return { worker: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تعديل بيانات العامل";
    return { error: message };
  }
}

export async function deleteWorkerAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await localStore.deleteWorker(id);
    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/clients");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل حذف العامل";
    return { error: message };
  }
}

export async function getWorkerAttendanceAction(workerId?: string): Promise<WorkerAttendance[]> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  try {
    return await localStore.getWorkerAttendance(workerId);
  } catch {
    console.warn("[workers] Failed to read attendance from local store");
    return [];
  }
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

  try {
    const newRecord = await localStore.createWorkerAttendance({
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
    });

    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/", "layout");
    return { record: newRecord };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تسجيل الحضور";
    return { error: message };
  }
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

  try {
    const updated = await localStore.updateWorkerAttendance(id, {
      date,
      ...(dayName ? { day: dayName } : {}),
      check_in_time,
      departure_time,
      daily_hours,
      delay,
      deduction,
      advances,
      notes,
    });

    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/", "layout");
    return { record: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل تعديل السجل";
    return { error: message };
  }
}

export async function deleteWorkerAttendanceAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  try {
    await localStore.deleteWorkerAttendance(id);
    revalidatePath("/workers");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "فشل حذف السجل";
    return { error: message };
  }
}
