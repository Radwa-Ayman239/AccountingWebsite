import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export interface CurrentUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    let role: UserRole = "viewer";
    const jwtRole = user.app_metadata?.role;
    if (jwtRole === "admin" || jwtRole === "viewer") {
      role = jwtRole;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin" || profile?.role === "viewer") {
        role = profile.role;
      }
    }

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name,
      role,
      isAdmin: role === "admin",
    };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Supabase is not configured")) {
      throw err;
    }
    return null;
  }
}

/**
 * Server guard: throws if the caller is not an authenticated admin.
 */
export async function assertAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("401: Unauthorized");
  }
  if (!user.isAdmin) {
    throw new Error("403: Forbidden - Admin privileges required");
  }
  return user;
}