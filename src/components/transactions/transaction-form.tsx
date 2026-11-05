"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/(dashboard)/transactions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Transaction, Client, TransactionType, Category, PaymentStatus } from "@/lib/types";

interface TransactionFormProps {
  transaction?: Transaction;
  clients: Pick<Client, "id" | "name">[];
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = [
  "wood",
  "hinges",
  "handles",
  "dish_racks",
  "trolley",
  "trash_basket",
  "pull_out",
  "magic_corner",
  "gas_springs",
  "rent",
  "utilities",
  "maintenance",
  "overhead",
  "other",
];

export function TransactionForm({
  transaction,
  clients,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);

  const [clientId, setClientId] = useState(
    transaction?.client_id || (clients.length > 0 ? clients[0].id : "general")
  );
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [category, setCategory] = useState<Category>(transaction?.category ?? "other");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    transaction?.payment_status ?? "paid"
  );
  const [date, setDate] = useState(
    transaction?.date ? transaction.date.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("client_id", clientId || "general");
    formData.set("type", type);
    formData.set("category", category);
    formData.set("payment_status", paymentStatus);
    formData.set("date", date);

    const result = transaction
      ? await updateTransactionAction(transaction.id, formData)
      : await createTransactionAction(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(
        transaction ? t.common.updatedSuccessfully : t.common.createdSuccessfully
      );
      setLoading(false);
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client */}
        <div className="flex flex-col gap-2">
          <Label>العميل / جهة المعاملة *</Label>
          <Select
            value={clientId}
            onValueChange={(val) => {
              setClientId(val);
              if (val === "general" && !["rent", "utilities", "maintenance", "overhead"].includes(category)) {
                setCategory("overhead");
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.transactions.selectClient} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                🏢 مصروفات عامة وإدارية (إيجار، فواتير، صيانة...)
              </SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  👤 عميل: {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">{t.transactions.date} *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type */}
        <div className="flex flex-col gap-2">
          <Label>{t.transactions.type} *</Label>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <SelectTrigger>
              <SelectValue placeholder={t.transactions.selectType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">{t.transactions.income}</SelectItem>
              <SelectItem value="expense">{t.transactions.expense}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label>{t.transactions.category} *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger>
              <SelectValue placeholder={t.transactions.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t.transactions.categories[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status */}
        <div className="flex flex-col gap-2">
          <Label>{t.transactions.paymentStatus} *</Label>
          <Select
            value={paymentStatus}
            onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.transactions.selectStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">{t.transactions.paid}</SelectItem>
              <SelectItem value="pending">{t.transactions.pending}</SelectItem>
              <SelectItem value="overdue">{t.transactions.overdue}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">{t.transactions.amount} *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={transaction?.amount ?? ""}
            placeholder="0.00"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">{t.transactions.description}</Label>
          <Input
            id="description"
            name="description"
            defaultValue={transaction?.description ?? ""}
            placeholder={t.transactions.description}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
        </Button>
      </div>
    </form>
  );
}
