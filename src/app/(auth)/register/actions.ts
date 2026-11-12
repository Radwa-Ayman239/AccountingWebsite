"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email) {
    return { error: "البريد الإلكتروني مطلوب (Email is required)" };
  }

  if (password !== confirmPassword) {
    return { error: "كلمتا المرور غير متطابقتين (Passwords do not match)" };
  }

  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل (Minimum 8 characters)" };
  }

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data?.user) {
      return { error: "فشل إنشاء الحساب (Failed to create account)" };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب";
    return { error: message };
  }
}
