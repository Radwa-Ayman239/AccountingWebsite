import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-adapter";
import { getClients } from "./actions";
import { getUserSettings } from "../settings/actions";
import { ClientsContent } from "./clients-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();
  const currency = settings?.currency ?? "EGP";
  const clients = await getClients();

  return <ClientsContent clients={clients} currency={currency} />;
}
