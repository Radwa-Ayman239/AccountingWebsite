"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/clients/client-form";
import { ClientTable } from "@/components/clients/client-table";
import { useUserRole } from "@/hooks/use-user-role";
import { Plus, Search } from "lucide-react";

interface ClientsContentProps {
  clients: Client[];
  currency: string;
}

export function ClientsContent({ clients, currency }: ClientsContentProps) {
  const { t } = useLocale();
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_info.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || c.project_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.clients.title}</h1>
          <p className="text-muted-foreground">
            {t.clients.clientCount}: {clients.length}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            {t.clients.addClient}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.clients.searchClients}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.clients.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.clients.allStatuses}</SelectItem>
            <SelectItem value="active">{t.clients.active}</SelectItem>
            <SelectItem value="completed">{t.clients.completed}</SelectItem>
            <SelectItem value="delivered">{t.clients.delivered}</SelectItem>
            <SelectItem value="on_hold">{t.clients.onHold}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ClientTable clients={filtered} currency={currency} />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.clients.addClient}</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSuccess={() => {
              setShowAddDialog(false);
              router.refresh();
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
