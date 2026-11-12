"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const identifier = (
    (formData.get("email") as string) ||
    (formData.get("identifier") as string)
  )?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!identifier || !password) {
    return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.session) {
      return { error: "فشل إنشاء الجلسة (Failed to create session)" };
    }

    // Ensure cookies are set by accessing them
    await cookies();

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
    return { error: message };
  }
}
