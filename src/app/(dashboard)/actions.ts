"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseActive, SESSION_COOKIE_NAME } from "@/lib/auth-adapter";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  if (isSupabaseActive()) {
    try {
      const supabase = await createServerSupabase();
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
  }

  redirect("/login");
}
