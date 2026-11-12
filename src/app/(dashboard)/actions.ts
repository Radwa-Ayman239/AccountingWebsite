"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}
