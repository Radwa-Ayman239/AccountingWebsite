"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import type { Transaction, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { useUserRole } from "@/hooks/use-user-role";
import { Plus } from "lucide-react";

interface TransactionsContentProps {
  initialTransactions: Transaction[];
  clients: Pick<Client, "id" | "name">[];
  currency: string;
}

export function TransactionsContent({
  initialTransactions,
  clients,
  currency,
}: TransactionsContentProps) {
  const { t } = useLocale();
  const { isAdmin } = useUserRole();
  const router = useRouter();

  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setStatus("all");
    setClientId("all");
    setStartDate("");
    setEndDate("");
  };

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const descMatch = tx.description?.toLowerCase().includes(query);
        const clientMatch = tx.client?.name?.toLowerCase().includes(query);
        if (!descMatch && !clientMatch) return false;
      }

      if (type !== "all" && tx.type !== type) return false;
      if (category !== "all" && tx.category !== category) return false;
      if (status !== "all" && tx.payment_status !== status) return false;
      if (clientId !== "all") {
        if (clientId === "general") {
          const isGeneral = tx.client_id === "general" || !tx.client_id;
          if (!isGeneral) return false;
        } else if (tx.client_id !== clientId) {
          return false;
        }
      }

      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      return true;
    });
  }, [
    initialTransactions,
    search,
    type,
    category,
    status,
    clientId,
    startDate,
    endDate,
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.transactions.title}</h1>
          <p className="text-muted-foreground">
            {t.transactions.transactionCount}: {filteredTransactions.length}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          {t.transactions.addTransaction}
        </Button>
      </div>

      {/* Filter panel */}
      <TransactionFilters
        clients={clients}
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        clientId={clientId}
        onClientIdChange={setClientId}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onReset={handleResetFilters}
      />

      {/* Table / List */}
      <TransactionTable
        transactions={filteredTransactions}
        clients={clients}
        currency={currency}
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.transactions.addTransaction}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            clients={clients}
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
