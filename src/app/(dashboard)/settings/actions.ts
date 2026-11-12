"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isSupabaseActive, shouldUseSupabase } from "@/lib/auth-adapter";
import { localStore } from "@/lib/store";
import { revalidatePath } from "next/cache";
import type { Currency, UserSettings } from "@/lib/types";

export async function getUserSettings(): Promise<UserSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) return data;
    } catch {
      // Fallback
    }
  }

  // Local Store Mode
  const settings = await localStore.getSettings(user.id);
  if (!settings) {
    return await localStore.upsertSettings({
      user_id: user.id,
      currency: "EGP",
      locale: "ar",
      theme: "system",
    });
  }
  return settings;
}

export async function updateUserSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const currency = (formData.get("currency") as Currency) || "EGP";
  const locale = (formData.get("locale") as "ar" | "en") || "ar";
  const theme = (formData.get("theme") as "light" | "dark" | "system") || "system";

  if (shouldUseSupabase(user)) {
    try {
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

      if (!error) {
        revalidatePath("/", "layout");
        return { success: true };
      }
    } catch {
      // Fallback
    }
  }

  await localStore.upsertSettings({
    user_id: user.id,
    currency,
    locale,
    theme,
  });

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

  if (shouldUseSupabase(user)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (!error) return { success: true };
    } catch {
      // Fallback
    }
  }

  await localStore.updateUser(user.id, { password: newPassword });

  return { success: true };
}
