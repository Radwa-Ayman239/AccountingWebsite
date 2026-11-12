"use server";

import { cookies } from "next/headers";
import { localStore } from "@/lib/store";
import { isSupabaseActive, SESSION_COOKIE_NAME } from "@/lib/auth-adapter";
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

  // 1. Supabase Mode
  if (isSupabaseActive()) {
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

      if (!error && data?.user) {
        return { success: true };
      }
      // If error occurred with Supabase, fall through to local registration
    } catch {
      // Fall through to local
    }
  }

  // 2. Standalone Local Database Mode
  try {
    const existing = await localStore.findUserByEmail(email);
    if (existing) {
      return { error: "هذا البريد الإلكتروني مستخدم بالفعل (Email already registered)" };
    }

    const newUser = await localStore.createUser({
      id: "usr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      email,
      password,
      full_name: fullName || email.split("@")[0],
    });

    // Set local session cookie
    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
      }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      }
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب";
    return { error: message };
  }
}
