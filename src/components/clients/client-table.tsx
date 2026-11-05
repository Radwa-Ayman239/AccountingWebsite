"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/format";
import { deleteClientAction } from "@/app/(dashboard)/clients/actions";
import type { Client } from "@/lib/types";
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
import { ClientForm } from "./client-form";
import { useUserRole } from "@/hooks/use-user-role";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientTableProps {
  clients: Client[];
  currency: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  on_hold: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ClientTable({ clients, currency }: ClientTableProps) {
  const { t, locale } = useLocale();
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t.clients.active,
      completed: t.clients.completed,
      delivered: t.clients.delivered,
      on_hold: t.clients.onHold,
      cancelled: t.clients.cancelled,
    };
    return labels[status] ?? status;
  };

  const formatAmount = (amount: number) =>
    formatCurrency(
      amount,
      currency as "EGP" | "SAR" | "AED" | "USD" | "EUR",
      locale
    );

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteClientAction(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t.common.deletedSuccessfully);
      router.refresh();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-lg font-medium">{t.clients.noClients}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.clients.noClientsMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">{t.clients.clientName}</TableHead>
              <TableHead className="text-center">{t.clients.expenses} (L.E)</TableHead>
              <TableHead className="text-center">{t.clients.revenue} (L.E)</TableHead>
              <TableHead className="text-center">{t.clients.pending} (L.E)</TableHead>
              <TableHead className="text-center">{t.clients.overdue} (L.E)</TableHead>
              <TableHead className="text-center font-bold">{t.clients.profit} (L.E)</TableHead>
              {isAdmin && <TableHead className="text-center">{t.common.actions}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const profit = client.profit ?? (client.revenue ?? 0) - (client.expenses ?? 0);
              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{client.name}</span>
                      {client.contact_info && (
                        <span className="text-xs text-muted-foreground">{client.contact_info}</span>
                      )}
                    </div>
                  </TableCell>
                  {/* المصروفات */}
                  <TableCell className="text-center whitespace-nowrap text-destructive font-medium">
                    {formatAmount(client.expenses ?? 0)}
                  </TableCell>
                  {/* الإيرادات */}
                  <TableCell className="text-center whitespace-nowrap text-success font-medium">
                    {formatAmount(client.revenue ?? 0)}
                  </TableCell>
                  {/* المعلق */}
                  <TableCell className="text-center whitespace-nowrap text-amber-600 font-medium">
                    {formatAmount(client.pending ?? 0)}
                  </TableCell>
                  {/* المتأخر */}
                  <TableCell className="text-center whitespace-nowrap text-rose-600 font-medium">
                    {formatAmount(client.overdue ?? 0)}
                  </TableCell>
                  {/* إجمالي الربح */}
                  <TableCell
                    className={cn(
                      "text-center whitespace-nowrap font-bold",
                      profit >= 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {formatAmount(profit)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {clients.map((client) => {
          const profit = client.profit ?? (client.revenue ?? 0) - (client.expenses ?? 0);
          return (
            <div
              key={client.id}
              className="rounded-lg border bg-card p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{client.name}</p>
                  {client.contact_info && (
                    <p className="text-xs text-muted-foreground">{client.contact_info}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(STATUS_COLORS[client.project_status])}
                >
                  {getStatusLabel(client.project_status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                <div className="rounded bg-muted/40 p-2">
                  <p className="text-muted-foreground text-xs">{t.clients.expenses} (L.E)</p>
                  <p className="font-medium text-destructive">{formatAmount(client.expenses ?? 0)}</p>
                </div>
                <div className="rounded bg-muted/40 p-2">
                  <p className="text-muted-foreground text-xs">{t.clients.revenue} (L.E)</p>
                  <p className="font-medium text-success">{formatAmount(client.revenue ?? 0)}</p>
                </div>
                <div className="rounded bg-muted/40 p-2">
                  <p className="text-muted-foreground text-xs">{t.clients.pending} (L.E)</p>
                  <p className="font-medium text-amber-600">{formatAmount(client.pending ?? 0)}</p>
                </div>
                <div className="rounded bg-muted/40 p-2">
                  <p className="text-muted-foreground text-xs">{t.clients.overdue} (L.E)</p>
                  <p className="font-medium text-rose-600">{formatAmount(client.overdue ?? 0)}</p>
                </div>
                <div className="col-span-2 rounded bg-primary/10 p-2">
                  <p className="text-muted-foreground text-xs font-bold">{t.clients.profit} (L.E)</p>
                  <p className={cn("text-base font-bold", profit >= 0 ? "text-primary" : "text-destructive")}>
                    {formatAmount(profit)}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-1 border-t pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditClient(client)}
                  >
                    <Pencil className="h-3 w-3" />
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(client.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                    {t.common.delete}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.clients.editClient}</DialogTitle>
          </DialogHeader>
          {editClient && (
            <ClientForm
              client={editClient}
              onSuccess={() => {
                setEditClient(null);
                router.refresh();
              }}
              onCancel={() => setEditClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.clients.deleteClientConfirm}</DialogTitle>
            <DialogDescription>
              {t.clients.deleteClientMessage}
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
