import { localStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth-adapter";
import { redirect } from "next/navigation";
import { WorkersContent } from "./workers-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "العمال والرواتب | المحاسب الذكي",
};

export default async function WorkersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const workers = await localStore.getWorkers();
  const attendance = await localStore.getWorkerAttendance();

  return (
    <WorkersContent
      initialWorkers={workers}
      initialAttendance={attendance}
    />
  );
}
