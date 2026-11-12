"use server";

import { cookies } from "next/headers";

// Hardcoded credentials for single user - ID matches database schema
const HARDCODED_USER = {
  username: "Adel Mohamed123",
  password: "w0rkh@st0bed0ne",
  id: "00000000-0000-0000-0000-000000000001",
  email: "adel@example.com",
  role: "admin",
};

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  // Check against hardcoded credentials
  if (username === HARDCODED_USER.username && password === HARDCODED_USER.password) {
    // Set a simple session cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_session", JSON.stringify({
      id: HARDCODED_USER.id,
      username: HARDCODED_USER.username,
      role: HARDCODED_USER.role,
      timestamp: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("[login] Login successful for:", username);
    return { success: true };
  }

  console.error("[login] Invalid credentials for:", username);
  return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}
