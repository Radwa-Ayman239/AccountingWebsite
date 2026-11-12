import { getCurrentUser } from "@/lib/auth-adapter";
import { redirect } from "next/navigation";
import { WorkersContent } from "./workers-content";
import { getWorkersAction, getWorkerAttendanceAction } from "./actions";

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

  const workers = await getWorkersAction();
  const attendance = await getWorkerAttendanceAction();

  return (
    <WorkersContent
      initialWorkers={workers}
      initialAttendance={attendance}
    />
  );
}
