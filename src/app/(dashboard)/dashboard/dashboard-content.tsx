"use client";

import { useLocale } from "@/lib/i18n/context";
import { formatCurrency, formatAmount, formatDate } from "@/lib/format";
import type {
  DashboardMetrics,
  MonthlyData,
  CategoryBreakdown,
  ClientProfitability,
  Transaction,
} from "@/lib/types";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";
import { ClientProfitabilityChart } from "@/components/dashboard/client-profitability";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  LayoutDashboard,
  Building2,
  Banknote,
  TrendingUp,
  TrendingDown,
  HardHat,
  Boxes,
  Home,
  Zap,
  Wrench,
  Receipt,
  Equal,
  Minus,
  Plus,
} from "lucide-react";

interface DashboardContentProps {
  metrics: DashboardMetrics;
  recentTransactions: Transaction[];
  monthlyTrend: MonthlyData[];
  expenseBreakdown: CategoryBreakdown[];
  clientProfitability: ClientProfitability[];
  generalTransactions?: Transaction[];
  currency: string;
}

export function DashboardContent({
  metrics,
  recentTransactions,
  monthlyTrend,
  expenseBreakdown,
  clientProfitability,
  generalTransactions = [],
  currency,
}: DashboardContentProps) {
  const { t, locale } = useLocale();

  // General expenses by category
  const rentTotal = generalTransactions
    .filter((t) => t.category === "rent")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const utilitiesTotal = generalTransactions
    .filter((t) => t.category === "utilities")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const maintenanceTotal = generalTransactions
    .filter((t) => t.category === "maintenance")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const otherOverheadTotal = generalTransactions
    .filter((t) => t.category === "overhead" || (!["rent", "utilities", "maintenance"].includes(t.category)))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const categoryNameMap: Record<string, string> = {
    rent: "إيجار",
    utilities: "كهرباء ومرافق",
    maintenance: "صيانة",
    overhead: "مصاريف عامة وإدارية",
    wood: "خشب",
    hinges: "مفصلات",
    handles: "مقابض",
    dish_racks: "مطبقيات",
    trolley: "ترولي",
    trash_basket: "باسكت زبالة",
    pull_out: "بول اوت",
    magic_corner: "ماجيك",
    gas_springs: "بساتم",
    other: "أخرى",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          {t.dashboard.title} (وحدة التحكم الرئيسية)
        </h1>
        <p className="text-muted-foreground text-sm">
          متابعة الإيرادات والمصروفات العامة وحساب الرصيد الفعلي في الخزينة
        </p>
      </div>

      {/* Main KPI Stat Cards */}
      <MetricsCards metrics={metrics} currency={currency} />

      {/* Tabs: Overview, General Expenses, Actual Budget */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة عامة والتحليلات</span>
          </TabsTrigger>
          <TabsTrigger value="general_expenses" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-rose-500" />
            <span>المصروفات العامة (إيجار، صيانة...)</span>
          </TabsTrigger>
          <TabsTrigger value="actual_budget" className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-600" />
            <span>الرصيد الفعلي في الخزينة</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Charts */}
        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyChart data={monthlyTrend} currency={currency} />
            <ExpenseBreakdownChart data={expenseBreakdown} currency={currency} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTransactionsList
              transactions={recentTransactions}
              currency={currency}
            />
            <ClientProfitabilityChart
              data={clientProfitability}
              currency={currency}
            />
          </div>
        </TabsContent>

        {/* Tab 2: General Expenses Tab */}
        <TabsContent value="general_expenses" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">إيجار المقر والورشة</span>
                <Home className="h-4 w-4 text-rose-600" />
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {formatCurrency(rentTotal, currency as any, locale)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">مصروفات الإيجار الثابتة</p>
            </Card>

            <Card className="p-4 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">كهرباء ومرافق وفواتير</span>
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {formatCurrency(utilitiesTotal, currency as any, locale)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">كهرباء، مياه، غاز، انترنت</p>
            </Card>

            <Card className="p-4 border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">صيانة دورية ومعدات</span>
                <Wrench className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-foreground mt-1">
                {formatCurrency(maintenanceTotal, currency as any, locale)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">صيانة الآلات وقطع الغيار</p>
            </Card>

            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-primary">إجمالي المصروفات العامة</span>
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-primary mt-1">
                {formatCurrency(metrics.generalExpenses, currency as any, locale)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">شاملة جميع بنود التشغيل العامة</p>
            </Card>
          </div>

          {/* General Expenses Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-rose-500" />
                    جدول قيود المصروفات العامة ({generalTransactions.length})
                  </CardTitle>
                  <CardDescription>
                    المصروفات التشغيلية المسجلة بدون ارتباط بعميل محدد (مثل الإيجار، المرافق، الصيانة...)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {generalTransactions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  لا توجد مصروفات عامة مسجلة بعد. يمكنك تسجيلها من صفحة المعاملات باختيار «مصروفات عامة» كجهة المعاملة.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>البند / الفئة</TableHead>
                        <TableHead>الوصف والبيان</TableHead>
                        <TableHead className="text-center">المبلغ (L.E)</TableHead>
                        <TableHead className="text-center">حالة السداد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(tx.date, locale)}
                          </TableCell>
                          <TableCell className="font-semibold text-xs whitespace-nowrap">
                            <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-500/5">
                              {categoryNameMap[tx.category] || tx.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[260px] truncate">
                            {tx.description || "—"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-destructive whitespace-nowrap">
                            -{formatAmount(Number(tx.amount))}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              {tx.payment_status === "paid" ? "تم الصرف" : tx.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Actual Budget in Cash Tab */}
        <TabsContent value="actual_budget" className="mt-6 flex flex-col gap-6">
          <Card className="border-primary/30 bg-card">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Banknote className="h-6 w-6 text-primary" />
                حساب الرصيد الفعلي في الخزينة والميزانية (Actual Cash in Budget)
              </CardTitle>
              <CardDescription>
                المعادلة الحسابية المعتمدة: إجمالي الإيرادات الفعلية المحصلة - (مصروفات العملاء + المصروفات العامة + رواتب العمال)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Detailed Visual Step Breakdown */}
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {/* 1. Actual Income */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xl">
                      +
                    </div>
                    <div>
                      <p className="font-bold text-foreground">إجمالي الإيرادات الفعلية المحصلة</p>
                      <p className="text-xs text-muted-foreground">جميع الدفعات المستلمة من العملاء المؤكدة (Paid Income)</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-600">
                    +{formatAmount(metrics.totalRevenue)} L.E
                  </div>
                </div>

                {/* Minus Sign */}
                <div className="flex justify-center -my-2 text-muted-foreground">
                  <Minus className="h-5 w-5" />
                </div>

                {/* 2. Client Expenses */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xl">
                      -
                    </div>
                    <div>
                      <p className="font-bold text-foreground">مصروفات العملاء وخامات المشاريع</p>
                      <p className="text-xs text-muted-foreground">خشب، مفصلات، مقابض، توريدات واكسسوارات العملاء</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    -{formatAmount(metrics.clientExpenses)} L.E
                  </div>
                </div>

                {/* Minus Sign */}
                <div className="flex justify-center -my-2 text-muted-foreground">
                  <Minus className="h-5 w-5" />
                </div>

                {/* 3. General Expenses */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-xl">
                      -
                    </div>
                    <div>
                      <p className="font-bold text-foreground">المصروفات العامة والتشغيلية</p>
                      <p className="text-xs text-muted-foreground">إيجار الورشة/المقر، فواتير الكهرباء والمرافق، نفقات الصيانة</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-rose-600">
                    -{formatAmount(metrics.generalExpenses)} L.E
                  </div>
                </div>

                {/* Minus Sign */}
                <div className="flex justify-center -my-2 text-muted-foreground">
                  <Minus className="h-5 w-5" />
                </div>

                {/* 4. Worker Salaries */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xl">
                      -
                    </div>
                    <div>
                      <p className="font-bold text-foreground">إجمالي رواتب ومستحقات العمال</p>
                      <p className="text-xs text-muted-foreground">محسوبة تلقائياً على أساس 270 ساعة شهرياً بعد الخصومات والسلف</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-amber-600">
                    -{formatAmount(metrics.workerSalaries)} L.E
                  </div>
                </div>

                {/* Equal Sign */}
                <div className="flex justify-center -my-1 text-primary">
                  <Equal className="h-7 w-7" />
                </div>

                {/* Final Net Budget Result */}
                <div className="flex items-center justify-between p-5 rounded-xl border-2 border-primary bg-primary/10 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-lg text-foreground">الرصيد الفعلي المتبقي في الخزينة / الميزانية</p>
                      <p className="text-xs text-muted-foreground">صافي السيولة النقدية المتاحة حالياً بعد تغطية كافة المصاريف والرواتب</p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {metrics.actualBudget < 0 ? "-" : ""}
                    {formatAmount(Math.abs(metrics.actualBudget))} L.E
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
