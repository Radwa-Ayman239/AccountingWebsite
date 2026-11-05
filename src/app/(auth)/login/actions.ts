"use server";

import { cookies } from "next/headers";
import { localStore } from "@/lib/store";
import { SESSION_COOKIE_NAME, isSupabaseActive } from "@/lib/auth-adapter";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const identifier = (
    (formData.get("email") as string) ||
    (formData.get("identifier") as string)
  )?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!identifier || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  // 1. Supabase Mode
  if (isSupabaseActive()) {
    try {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تسجيل الدخول";
      return { error: message };
    }
  }

  // 2. Local Database Mode
  const cleanId = identifier.toLowerCase().replace(/\s+/g, "");
  const isDefaultAdminId =
    cleanId === "adelmohamed123" ||
    cleanId === "adelmohamed" ||
    cleanId === "adel" ||
    cleanId === "adelmohamed123@app.local";

  const isDefaultAdminPassword =
    password === "w0rkh@st0bed0ne" ||
    password === "W0rkh@st0bed0ne" ||
    password.toLowerCase() === "w0rkh@st0bed0ne";

  const PREDEFINED_ID = "usr-adel-mohamed-123";
  const PREDEFINED_NAME = "Adel Mohamed123";
  const PREDEFINED_EMAIL = "adelmohamed123@app.local";

  let user = await localStore.findUserById(PREDEFINED_ID);
  if (!user && isDefaultAdminId) {
    user = await localStore.createUser({
      id: PREDEFINED_ID,
      email: PREDEFINED_EMAIL,
      password: "w0rkh@st0bed0ne",
      full_name: PREDEFINED_NAME,
      role: "admin",
    });
  }

  // If identifier matches another user in the database, find that user
  if (!user || (!isDefaultAdminId && user.email.toLowerCase() !== identifier.toLowerCase())) {
    const db = await localStore.getDb();
    const found = db.users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.full_name && u.full_name.toLowerCase().replace(/\s+/g, "") === cleanId) ||
        u.id === identifier
    );
    if (found) {
      user = found;
    }
  }

  if (!user) {
    return {
      error: "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور",
    };
  }

  const isPasswordValid =
    user.password === password ||
    (isDefaultAdminId && isDefaultAdminPassword);

  if (!isPasswordValid) {
    return {
      error: "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور",
    };
  }

  // If default admin, ensure role is admin
  const userRole = isDefaultAdminId ? "admin" : (user.role || "viewer");

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name || PREDEFINED_NAME,
      role: userRole,
    }),
    {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    }
  );

  return { success: true };
}
