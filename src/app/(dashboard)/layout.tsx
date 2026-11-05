import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-adapter";
import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import { RoleProvider } from "@/lib/auth/role-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <RoleProvider user={user} role={user.role}>
        <AppShell userEmail={user.fullName || user.email} userRole={user.role}>
          {children}
        </AppShell>
      </RoleProvider>
    </QueryProvider>
  );
}
