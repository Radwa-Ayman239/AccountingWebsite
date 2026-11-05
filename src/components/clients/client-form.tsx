"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { createClientAction, updateClientAction } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/lib/types";

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(client?.project_status ?? "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("project_status", status);

    const result = client
      ? await updateClientAction(client.id, formData)
      : await createClientAction(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(
        client ? t.common.updatedSuccessfully : t.common.createdSuccessfully
      );
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t.clients.clientName} *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={client?.name ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact_info">{t.clients.contactInfo}</Label>
        <Textarea
          id="contact_info"
          name="contact_info"
          rows={2}
          defaultValue={client?.contact_info ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.clients.projectStatus}</Label>
        <Select value={status} onValueChange={(val) => setStatus(val as typeof status)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t.clients.active}</SelectItem>
            <SelectItem value="completed">{t.clients.completed}</SelectItem>
            <SelectItem value="delivered">{t.clients.delivered}</SelectItem>
            <SelectItem value="on_hold">{t.clients.onHold}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">{t.common.notes}</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={client?.notes ?? ""}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t.common.save
          )}
        </Button>
      </div>
    </form>
  );
}
