import { redirect } from "next/navigation";
import { getUserSettings } from "./actions";
import { getCurrentUser } from "@/lib/auth-adapter";
import { SettingsContent } from "./settings-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();

  return (
    <SettingsContent
      initialSettings={settings}
      userEmail={user.email}
    />
  );
}
