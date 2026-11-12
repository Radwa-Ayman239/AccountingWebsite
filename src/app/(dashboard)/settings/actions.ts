"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-adapter";
import { revalidatePath } from "next/cache";
import type { Currency, UserSettings } from "@/lib/types";

export async function getUserSettings(): Promise<UserSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[settings] Error fetching settings:", error.message);
    }
    return {
      id: "",
      user_id: user.id,
      currency: "EGP",
      locale: "ar",
      theme: "system",
    };
  }

  return data;
}

export async function updateUserSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const currency = (formData.get("currency") as Currency) || "EGP";
  const locale = (formData.get("locale") as "ar" | "en") || "ar";
  const theme = (formData.get("theme") as "light" | "dark" | "system") || "system";

  const supabase = await createClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      currency,
      locale,
      theme,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
