import { cookies } from "next/headers";
import { localStore } from "@/lib/store";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export const SESSION_COOKIE_NAME = "mohaseb_local_session";

export interface CurrentUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isAdmin: boolean;
}

export function isSupabaseActive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    url.startsWith("http") &&
    !url.includes("your-supabase-url") &&
    !url.includes("placeholder.supabase.co")
  );
}

export function shouldUseSupabase(user?: CurrentUser | null): boolean {
  if (!isSupabaseActive()) return false;
  if (!user) return false;
  // If user is from local store or built-in admin (starts with usr-), use localStore
  if (user.id.startsWith("usr-")) return false;
  return true;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (isSupabaseActive()) {
    try {
      const supabase = await createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Extract role from app_metadata (JWT) or fallback to profiles table
        let role: UserRole = (user.app_metadata?.role as UserRole) || "viewer";

        if (!user.app_metadata?.role) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role) {
            role = profile.role as UserRole;
          }
        }

        return {
          id: user.id,
          email: user.email ?? "",
          fullName: user.user_metadata?.full_name,
          role,
          isAdmin: role === "admin",
        };
      }
    } catch {
      // Fallback to local cookie if Supabase network fails
    }
  }

  // Local Standalone Fallback
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) return null;

  try {
    const parsed = JSON.parse(sessionCookie.value) as {
      id?: string;
      email?: string;
      fullName?: string;
      role?: UserRole;
    };
    if (!parsed || (!parsed.id && !parsed.email)) return null;

    let user = parsed.id ? await localStore.findUserById(parsed.id) : undefined;
    if (!user && parsed.email) {
      user = await localStore.findUserByEmail(parsed.email);
    }

    const role: UserRole = user?.role ?? parsed.role ?? "viewer";

    return {
      id: user?.id ?? parsed.id ?? "usr-default",
      email: user?.email ?? parsed.email ?? "",
      fullName: user?.full_name ?? parsed.fullName ?? "User",
      role,
      isAdmin: role === "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Server guard: throws or returns error if user is not authenticated or not an admin
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
