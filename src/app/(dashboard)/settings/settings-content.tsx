"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { useTheme } from "next-themes";
import {
  updateUserSettingsAction,
  updatePasswordAction,
} from "@/app/(dashboard)/settings/actions";
import type { Currency, UserSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2, Globe, Moon, Shield, Save, ShieldCheck, Eye } from "lucide-react";
import { toast } from "sonner";

interface SettingsContentProps {
  initialSettings: UserSettings | null;
  userEmail: string;
}

const CURRENCIES: Currency[] = ["EGP", "SAR", "AED", "USD", "EUR"];

export function SettingsContent({
  initialSettings,
  userEmail,
}: SettingsContentProps) {
  const { t, locale, setLocale } = useLocale();
  const { isAdmin, role } = useUserRole();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Settings State
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    initialSettings?.currency ?? "EGP"
  );
  const [selectedLocale, setSelectedLocale] = useState<"ar" | "en">(
    (initialSettings?.locale as "ar" | "en") ?? locale
  );
  const [selectedTheme, setSelectedTheme] = useState<string>(
    initialSettings?.theme ?? (theme || "system")
  );

  const [savingPreferences, setSavingPreferences] = useState(false);

  // Password State
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSavePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingPreferences(true);

    const formData = new FormData();
    formData.set("currency", selectedCurrency);
    formData.set("locale", selectedLocale);
    formData.set("theme", selectedTheme);

    const result = await updateUserSettingsAction(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      setLocale(selectedLocale);
      setTheme(selectedTheme);
      toast.success(t.settings.savedSuccessfully);
      router.refresh();
    }
    setSavingPreferences(false);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setChangingPassword(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await updatePasswordAction(formData);

    if (result.error) {
      setPasswordError(result.error);
      toast.error(result.error);
    } else {
      toast.success(t.common.savedSuccessfully);
      form.reset();
    }
    setChangingPassword(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.preferences}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{t.settings.general}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>{t.settings.appearance}</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{t.settings.account}</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.general}</CardTitle>
              <CardDescription>{t.settings.preferences}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences} className="space-y-6">
                {/* Currency */}
                <div className="flex flex-col gap-2 max-w-md">
                  <Label>{t.settings.currency}</Label>
                  <Select
                    value={selectedCurrency}
                    onValueChange={(val) => setSelectedCurrency(val as Currency)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.selectCurrency} />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {t.settings.currencies[curr]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="flex flex-col gap-2 max-w-md">
                  <Label>{t.settings.language}</Label>
                  <Select
                    value={selectedLocale}
                    onValueChange={(val) => setSelectedLocale(val as "ar" | "en")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.selectLanguage} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{t.settings.arabic}</SelectItem>
                      <SelectItem value="en">{t.settings.english}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={savingPreferences}>
                  {savingPreferences ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.common.save}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.appearance}</CardTitle>
              <CardDescription>{t.settings.theme}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences} className="space-y-6">
                <div className="flex flex-col gap-2 max-w-md">
                  <Label>{t.settings.theme}</Label>
                  <Select
                    value={selectedTheme}
                    onValueChange={setSelectedTheme}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.selectTheme} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t.settings.lightMode}</SelectItem>
                      <SelectItem value="dark">{t.settings.darkMode}</SelectItem>
                      <SelectItem value="system">{t.settings.systemMode}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={savingPreferences}>
                  {savingPreferences ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.common.save}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="mt-4">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.account}</CardTitle>
                <CardDescription>{t.common.details}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 max-w-md">
                  <Label>{t.common.email}</Label>
                  <Input value={userEmail} disabled dir="ltr" />
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <Label>{locale === "ar" ? "نوع الصلاحية (Role)" : "Account Role"}</Label>
                  <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/30">
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {locale === "ar" ? "مسؤول (Admin)" : "Administrator"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {locale === "ar"
                              ? "صلاحيات كاملة: الإضافة، والتعديل، والحذف، والاطلاع."
                              : "Full access: Create, edit, delete, and view all records."}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {locale === "ar" ? "مشاهد (Viewer)" : "Viewer"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {locale === "ar"
                              ? "صلاحية الاطلاع فقط: قراءة البيانات والتقارير دون إمكانية التعديل."
                              : "Read-only access: View dashboard, transactions, and reports without edit rights."}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.settings.changePassword}</CardTitle>
                <CardDescription>{t.auth.resetPasswordMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {passwordError && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {passwordError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword">{t.auth.newPassword}</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      dir="ltr"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">
                      {t.auth.confirmPassword}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      dir="ltr"
                    />
                  </div>

                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t.settings.changePassword}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
