"use server";

import { headers } from "next/headers";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

function siteOrigin(headerStore: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const origin = headerStore.get("origin")?.trim();
  if (origin) return origin.replace(/\/$/, "");

  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (!host) return "";
  const proto = headerStore.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function register(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

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
    const headerStore = await headers();
    const origin = siteOrigin(headerStore);
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data?.user) {
      return { error: "فشل إنشاء الحساب (Failed to create account)" };
    }

    const alreadyRegistered =
      Array.isArray(data.user.identities) && data.user.identities.length === 0;
    if (alreadyRegistered) {
      return {
        error: "هذا البريد الإلكتروني مستخدم بالفعل (This email is already in use)",
      };
    }

    if (!data.session) {
      return { success: true, needsConfirmation: true };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب";
    return { error: message };
  }
}
