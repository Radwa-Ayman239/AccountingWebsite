import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-adapter";
import { getTransactions, getClientsForSelect } from "./actions";
import { getUserSettings } from "../settings/actions";
import { TransactionsContent } from "./transactions-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const settings = await getUserSettings();
  const currency = settings?.currency ?? "EGP";

  const [transactions, clients] = await Promise.all([
    getTransactions(),
    getClientsForSelect(),
  ]);

  return (
    <TransactionsContent
      initialTransactions={transactions}
      clients={clients}
      currency={currency}
    />
  );
}
