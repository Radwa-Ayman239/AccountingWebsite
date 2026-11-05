"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransactionAction } from "@/app/(dashboard)/transactions/actions";
import type { Transaction, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { useUserRole } from "@/hooks/use-user-role";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  clients: Pick<Client, "id" | "name">[];
  currency: string;
}

const STATUS_BADGES: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
};

export function TransactionTable({
  transactions,
  clients,
  currency,
}: TransactionTableProps) {
  const { t, locale } = useLocale();
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formatAmount = (amount: number) =>
    formatCurrency(
      amount,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      paid: t.transactions.paid,
      pending: t.transactions.pending,
      overdue: t.transactions.overdue,
    };
    return map[status] ?? status;
  };

  const getCategoryLabel = (category: string) => {
    const key = category as keyof typeof t.transactions.categories;
    return t.transactions.categories[key] ?? category;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteTransactionAction(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t.common.deletedSuccessfully);
      router.refresh();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-lg font-medium">{t.transactions.noTransactions}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.transactions.noTransactionsMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.transactions.date}</TableHead>
              <TableHead>{t.transactions.client}</TableHead>
              <TableHead>{t.transactions.type}</TableHead>
              <TableHead>{t.transactions.category}</TableHead>
              <TableHead>{t.transactions.description}</TableHead>
              <TableHead>{t.transactions.amount} (L.E)</TableHead>
              <TableHead>{t.transactions.paymentStatus}</TableHead>
              {isAdmin && <TableHead>{t.common.actions}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(tx.date, locale)}
                </TableCell>
                <TableCell className="font-medium">
                  {tx.client?.name ? (
                    tx.client.name
                  ) : tx.client_id === "general" || !tx.client_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-semibold bg-muted/80 px-2 py-0.5 rounded">
                      🏢 مصروفات عامة
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tx.type === "income" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {tx.type === "income"
                      ? t.transactions.income
                      : t.transactions.expense}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {getCategoryLabel(tx.category)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {tx.description || "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "whitespace-nowrap font-semibold",
                    tx.type === "income" ? "text-success" : "text-destructive"
                  )}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatAmount(Number(tx.amount))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(STATUS_BADGES[tx.payment_status])}
                  >
                    {getStatusLabel(tx.payment_status)}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTx(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(tx.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-3 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="rounded-lg border bg-card p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {tx.client?.name ? (
                    tx.client.name
                  ) : tx.client_id === "general" || !tx.client_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-semibold bg-muted/80 px-2 py-0.5 rounded">
                      🏢 مصروفات عامة
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(tx.date, locale)}
                </p>
              </div>
              <div className="flex gap-1.5 items-center">
                <Badge
                  variant={tx.type === "income" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {tx.type === "income"
                    ? t.transactions.income
                    : t.transactions.expense}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", STATUS_BADGES[tx.payment_status])}
                >
                  {getStatusLabel(tx.payment_status)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {getCategoryLabel(tx.category)}
                {tx.description && ` · ${tx.description}`}
              </span>
              <span
                className={cn(
                  "font-bold",
                  tx.type === "income" ? "text-success" : "text-destructive"
                )}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatAmount(Number(tx.amount))}
              </span>
            </div>

            {isAdmin && (
              <div className="flex justify-end gap-1 border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditTx(tx)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t.common.edit}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(tx.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  {t.common.delete}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={() => setEditTx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.transactions.editTransaction}</DialogTitle>
          </DialogHeader>
          {editTx && (
            <TransactionForm
              transaction={editTx}
              clients={clients}
              onSuccess={() => {
                setEditTx(null);
                router.refresh();
              }}
              onCancel={() => setEditTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.transactions.deleteTransactionConfirm}</DialogTitle>
            <DialogDescription>
              {t.transactions.deleteTransactionMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.common.delete
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
