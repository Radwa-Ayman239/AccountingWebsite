import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

// Hardcoded user data - ID matches the database schema
const HARDCODED_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "Adel Mohamed123",
  email: "adel@example.com",
  fullName: "Adel Mohamed",
  role: "admin" as UserRole,
};

export interface CurrentUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get("auth_session");

    if (!authSession) return null;

    const sessionData = JSON.parse(authSession.value);
    if (sessionData.username === HARDCODED_USER.username) {
      return {
        id: HARDCODED_USER.id,
        email: HARDCODED_USER.email,
        fullName: HARDCODED_USER.fullName,
        role: HARDCODED_USER.role,
        isAdmin: HARDCODED_USER.role === "admin",
      };
    }

    return null;
  } catch (err) {
    console.error("[auth-adapter] Error getting current user:", err);
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