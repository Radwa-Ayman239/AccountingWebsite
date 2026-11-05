"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { formatAmount, calculateWorkedHours } from "@/lib/format";
import type { Worker, WorkerAttendance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  createWorkerAction,
  updateWorkerAction,
  deleteWorkerAction,
  createWorkerAttendanceAction,
  updateWorkerAttendanceAction,
  deleteWorkerAttendanceAction,
} from "./actions";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  HardHat,
  Clock,
  User,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkersContentProps {
  initialWorkers: Worker[];
  initialAttendance: WorkerAttendance[];
}

export function WorkersContent({
  initialWorkers,
  initialAttendance,
}: WorkersContentProps) {
  const { t, locale } = useLocale();
  const router = useRouter();

  // State with robust prop syncing (uses JSON fingerprint to avoid stale reads)
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [attendance, setAttendance] = useState<WorkerAttendance[]>(initialAttendance);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    initialWorkers.length > 0 ? initialWorkers[0].id : ""
  );

  // Use JSON fingerprints to detect when server passes new data
  const prevWorkersRef = useRef<string>("");
  const prevAttendanceRef = useRef<string>("");

  useEffect(() => {
    const fingerprint = JSON.stringify(initialWorkers.map(w => w.id + w.updated_at));
    if (fingerprint !== prevWorkersRef.current) {
      prevWorkersRef.current = fingerprint;
      setWorkers(initialWorkers);
      if (initialWorkers.length > 0 && !initialWorkers.find(w => w.id === selectedWorkerId)) {
        setSelectedWorkerId(initialWorkers[0].id);
      }
    }
  }, [initialWorkers, selectedWorkerId]);

  useEffect(() => {
    const fingerprint = JSON.stringify(initialAttendance.map(a => a.id + a.updated_at));
    if (fingerprint !== prevAttendanceRef.current) {
      prevAttendanceRef.current = fingerprint;
      setAttendance(initialAttendance);
    }
  }, [initialAttendance]);

  // Dialogs
  const [showAddWorkerDialog, setShowAddWorkerDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);

  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkerAttendance | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Live time calculation state for Add Attendance Dialog
  const [addCheckIn, setAddCheckIn] = useState("08:00 ص");
  const [addDeparture, setAddDeparture] = useState("05:00 م");
  const [addHours, setAddHours] = useState<number>(9);

  // Live time calculation state for Edit Attendance Dialog
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editDeparture, setEditDeparture] = useState("");
  const [editHours, setEditHours] = useState<number>(9);

  const [loading, setLoading] = useState(false);

  // Constants
  const STANDARD_MONTHLY_HOURS = 270;

  // Selected Worker & Computed Totals
  const selectedWorker = useMemo(() => {
    return workers.find((w) => w.id === selectedWorkerId) || workers[0] || null;
  }, [workers, selectedWorkerId]);

  const workerRecords = useMemo(() => {
    if (!selectedWorker) return [];
    return attendance
      .filter((a) => a.worker_id === selectedWorker.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, selectedWorker]);

  // Total hours worked
  const totalHoursWorked = useMemo(() => {
    return workerRecords.reduce((sum, r) => {
      const h =
        r.daily_hours !== undefined && !isNaN(Number(r.daily_hours)) && Number(r.daily_hours) > 0
          ? Number(r.daily_hours)
          : calculateWorkedHours(r.check_in_time, r.departure_time);
      return sum + h;
    }, 0);
  }, [workerRecords]);

  // Base monthly salary
  const baseSalary = selectedWorker ? Number(selectedWorker.monthly_salary) || 0 : 0;

  // Hourly rate based on 270 standard hours per month
  const hourlyRate = baseSalary > 0 ? baseSalary / STANDARD_MONTHLY_HOURS : 0;

  // Overtime / Additional hours
  const additionalHours = Math.max(0, totalHoursWorked - STANDARD_MONTHLY_HOURS);

  // Total salary without subtractions = (monthly salary / 270) * total hours spent at work
  const grossSalary = hourlyRate * totalHoursWorked;

  // Deductions & Advances
  const totalDeductions = useMemo(() => {
    return workerRecords.reduce((sum, r) => sum + (Number(r.deduction) || 0), 0);
  }, [workerRecords]);

  const totalAdvances = useMemo(() => {
    return workerRecords.reduce((sum, r) => sum + (Number(r.advances) || 0), 0);
  }, [workerRecords]);

  // Final Net Salary Due = gross salary - subtractions
  const finalSalary = grossSalary - totalDeductions - totalAdvances;

  // Sync add dialog hours when times change
  function handleAddCheckInChange(val: string) {
    setAddCheckIn(val);
    setAddHours(calculateWorkedHours(val, addDeparture));
  }

  function handleAddDepartureChange(val: string) {
    setAddDeparture(val);
    setAddHours(calculateWorkedHours(addCheckIn, val));
  }

  // Sync edit dialog state when opening
  function openEditRecord(rec: WorkerAttendance) {
    setEditingRecord(rec);
    const cIn = rec.check_in_time || "08:00 ص";
    const dep = rec.departure_time || "05:00 م";
    const hrs =
      rec.daily_hours !== undefined && !isNaN(Number(rec.daily_hours))
        ? Number(rec.daily_hours)
        : calculateWorkedHours(cIn, dep);
    setEditCheckIn(cIn);
    setEditDeparture(dep);
    setEditHours(hrs);
  }

  function handleEditCheckInChange(val: string) {
    setEditCheckIn(val);
    setEditHours(calculateWorkedHours(val, editDeparture));
  }

  function handleEditDepartureChange(val: string) {
    setEditDeparture(val);
    setEditHours(calculateWorkedHours(editCheckIn, val));
  }

  // Handlers: Worker CRUD
  async function handleCreateWorker(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createWorkerAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.worker) {
      toast.success("تم إضافة العامل بنجاح");
      setWorkers((prev) => [...prev, result.worker!]);
      setSelectedWorkerId(result.worker.id);
      setShowAddWorkerDialog(false);
      router.refresh();
    }
  }

  async function handleUpdateWorker(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingWorker) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateWorkerAction(editingWorker.id, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.worker) {
      toast.success("تم تحديث بيانات العامل بنجاح");
      setWorkers((prev) =>
        prev.map((w) => (w.id === result.worker!.id ? result.worker! : w))
      );
      setEditingWorker(null);
      router.refresh();
    }
  }

  async function handleDeleteWorker() {
    if (!deletingWorkerId) return;
    setLoading(true);
    const result = await deleteWorkerAction(deletingWorkerId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم حذف العامل وسجلاته بنجاح");
      const remaining = workers.filter((w) => w.id !== deletingWorkerId);
      setWorkers(remaining);
      setAttendance((prev) => prev.filter((a) => a.worker_id !== deletingWorkerId));
      if (selectedWorkerId === deletingWorkerId) {
        setSelectedWorkerId(remaining.length > 0 ? remaining[0].id : "");
      }
      setDeletingWorkerId(null);
      router.refresh();
    }
  }

  // Handlers: Attendance Record CRUD
  async function handleCreateRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedWorker) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("worker_id", selectedWorker.id);
    formData.set("check_in_time", addCheckIn);
    formData.set("departure_time", addDeparture);
    formData.set("daily_hours", String(addHours));

    const result = await createWorkerAttendanceAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.record) {
      toast.success("تم تسجيل بيانات الحضور وساعات العمل بنجاح");
      // Optimistically add the record with all fields
      const newRec = result.record;
      setAttendance((prev) => [newRec, ...prev]);
      setShowAddRecordDialog(false);
      // Reset add dialog state for next use
      setAddCheckIn("08:00 ص");
      setAddDeparture("05:00 م");
      setAddHours(9);
      router.refresh();
    }
  }

  async function handleUpdateRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingRecord) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("check_in_time", editCheckIn);
    formData.set("departure_time", editDeparture);
    formData.set("daily_hours", String(editHours));

    const result = await updateWorkerAttendanceAction(editingRecord.id, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.record) {
      toast.success("تم تعديل السجل بنجاح");
      const updatedRec = result.record;
      setAttendance((prev) =>
        prev.map((r) => (r.id === updatedRec.id ? updatedRec : r))
      );
      setEditingRecord(null);
      router.refresh();
    }
  }

  async function handleDeleteRecord() {
    if (!deletingRecordId) return;
    setLoading(true);
    const result = await deleteWorkerAttendanceAction(deletingRecordId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("تم حذف السجل بنجاح");
      setAttendance((prev) => prev.filter((r) => r.id !== deletingRecordId));
      setDeletingRecordId(null);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HardHat className="h-6 w-6 text-primary" />
            {t.workers.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            حساب الرواتب التلقائي على أساس 270 ساعة شهرياً مع احتساب الساعات الإضافية والانصراف والخصومات والسلف
          </p>
        </div>
        <Button onClick={() => setShowAddWorkerDialog(true)}>
          <Plus className="h-4 w-4" />
          {t.workers.addWorker}
        </Button>
      </div>

      {workers.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <HardHat className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold">{t.workers.noWorkers}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {t.workers.noWorkersMessage}
          </p>
          <Button onClick={() => setShowAddWorkerDialog(true)}>
            <Plus className="h-4 w-4" />
            {t.workers.addWorker}
          </Button>
        </Card>
      ) : (
        /* Main Workers Layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Workers Sidebar / Selector List */}
          <Card className="lg:col-span-1 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b">
              <span className="font-semibold text-sm">قائمة العمال ({workers.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddWorkerDialog(true)}
                className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                إضافة
              </Button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto">
              {workers.map((worker) => {
                const isSelected = selectedWorker?.id === worker.id;
                return (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border text-sm cursor-pointer transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card hover:bg-accent/60 text-card-foreground border-border"
                    )}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold truncate">{worker.name}</span>
                      <span
                        className={cn(
                          "text-xs",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {worker.job_title || "عامل"} · {formatAmount(worker.monthly_salary)} L.E
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          isSelected
                            ? "hover:bg-primary-foreground/20 text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorker(worker);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          isSelected
                            ? "hover:bg-destructive text-primary-foreground"
                            : "hover:bg-destructive/10 text-destructive"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingWorkerId(worker.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Selected Worker Attendance & Salary Table */}
          {selectedWorker && (
            <div className="lg:col-span-3 flex flex-col gap-5">
              {/* Worker Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    جدول العامل: {selectedWorker.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedWorker.job_title && `${selectedWorker.job_title} · `}
                    {selectedWorker.phone && `هاتف: ${selectedWorker.phone} · `}
                    المرتب الأساسي المسجل: {formatAmount(selectedWorker.monthly_salary)} L.E (على أساس 270 ساعة)
                  </p>
                </div>
                <Button onClick={() => setShowAddRecordDialog(true)}>
                  <Plus className="h-4 w-4" />
                  تسجيل حضور / انصراف / سلفة / خصم
                </Button>
              </div>

              {/* Automatic Financial Metrics Cards (270 Hours Formula) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Base Salary & Hourly Rate */}
                <Card className="p-3">
                  <span className="text-[11px] text-muted-foreground font-medium">المرتب الأساسي (270 س)</span>
                  <div className="text-base font-bold text-foreground mt-1">
                    {formatAmount(baseSalary)} L.E
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    الساعة: {formatAmount(hourlyRate)} L.E
                  </span>
                </Card>

                {/* 2. Total Hours Worked & Overtime */}
                <Card className="p-3 border-blue-500/20 bg-blue-500/5">
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">إجمالي الساعات المسجلة</span>
                  <div className="text-base font-bold text-blue-700 dark:text-blue-400 mt-1">
                    {totalHoursWorked.toFixed(1)} ساعة
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {additionalHours > 0 ? (
                      <span className="text-emerald-600 font-semibold">إضافي: +{additionalHours.toFixed(1)} س</span>
                    ) : (
                      `متبقي: ${(STANDARD_MONTHLY_HOURS - totalHoursWorked).toFixed(1)} س`
                    )}
                  </span>
                </Card>

                {/* 3. Gross Salary (hours * rate) */}
                <Card className="p-3 border-purple-500/20 bg-purple-500/5">
                  <span className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold">الراتب قبل الخصم</span>
                  <div className="text-base font-bold text-purple-700 dark:text-purple-400 mt-1">
                    {formatAmount(grossSalary)} L.E
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    ({formatAmount(hourlyRate)} × {totalHoursWorked.toFixed(1)} س)
                  </span>
                </Card>

                {/* 4. Deductions & Advances Subtractions */}
                <Card className="p-3 border-destructive/20 bg-destructive/5">
                  <span className="text-[11px] text-destructive font-semibold">إجمالي الخصومات والسلف</span>
                  <div className="text-base font-bold text-destructive mt-1">
                    -{formatAmount(totalDeductions + totalAdvances)} L.E
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    خصم: -{formatAmount(totalDeductions)} | سلف: -{formatAmount(totalAdvances)}
                  </span>
                </Card>

                {/* 5. Final Net Salary Due */}
                <Card className="p-3 col-span-2 sm:col-span-1 border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30">
                  <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
                    <Sparkles className="h-3 w-3" />
                    <span>صافي الراتب النهائي</span>
                  </div>
                  <div className="text-lg font-black text-primary mt-1">
                    {finalSalary < 0 ? "-" : ""}
                    {formatAmount(Math.abs(finalSalary))} L.E
                  </div>
                  <span className="text-[10px] text-primary/80 block mt-0.5 font-medium">
                    المستحق النهائي للصرف
                  </span>
                </Card>
              </div>

              {/* Attendance & Time Records Table */}
              <div className="overflow-x-auto rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[130px]">اليوم والتاريخ</TableHead>
                      <TableHead className="text-center">معاد الحضور</TableHead>
                      <TableHead className="text-center">معاد الانصراف</TableHead>
                      <TableHead className="text-center">ساعات العمل اليومية</TableHead>
                      <TableHead className="text-center">التأخير</TableHead>
                      <TableHead className="text-center text-destructive">الخصم (L.E)</TableHead>
                      <TableHead className="text-center text-amber-600">السلف (L.E)</TableHead>
                      <TableHead className="min-w-[120px]">ملاحظات</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workerRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-32 text-center text-muted-foreground"
                        >
                          {t.workers.noRecordsMessage}
                        </TableCell>
                      </TableRow>
                    ) : (
                      workerRecords.map((rec) => {
                        const calculatedHrs =
                          rec.daily_hours !== undefined && !isNaN(Number(rec.daily_hours)) && Number(rec.daily_hours) > 0
                            ? Number(rec.daily_hours)
                            : calculateWorkedHours(rec.check_in_time, rec.departure_time);

                        return (
                          <TableRow key={rec.id}>
                            {/* اليوم والتاريخ */}
                            <TableCell className="font-medium whitespace-nowrap">
                              <span className="text-primary font-semibold me-1.5">{rec.day}</span>
                              <span className="text-xs text-muted-foreground">{rec.date}</span>
                            </TableCell>

                            {/* معاد الحضور */}
                            <TableCell className="text-center whitespace-nowrap">
                              <Badge variant="outline" className="font-normal text-xs bg-muted/40">
                                <Clock className="h-3 w-3 me-1 text-emerald-600" />
                                {rec.check_in_time || "08:00 ص"}
                              </Badge>
                            </TableCell>

                            {/* معاد الانصراف */}
                            <TableCell className="text-center whitespace-nowrap">
                              <Badge variant="outline" className="font-normal text-xs bg-muted/40">
                                <LogOut className="h-3 w-3 me-1 text-rose-500" />
                                {rec.departure_time || "05:00 م"}
                              </Badge>
                            </TableCell>

                            {/* ساعات العمل اليومية */}
                            <TableCell className="text-center whitespace-nowrap">
                              <Badge
                                variant="secondary"
                                className="font-bold text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                              >
                                {calculatedHrs} ساعة
                              </Badge>
                            </TableCell>

                            {/* التأخير */}
                            <TableCell className="text-center whitespace-nowrap text-xs">
                              {rec.delay && rec.delay !== "لا يوجد" ? (
                                <span className="text-amber-600 font-medium">{rec.delay}</span>
                              ) : (
                                <span className="text-muted-foreground">لا يوجد</span>
                              )}
                            </TableCell>

                            {/* الخصم */}
                            <TableCell className="text-center whitespace-nowrap font-medium text-destructive">
                              {Number(rec.deduction) > 0 ? `-${formatAmount(rec.deduction)}` : "0.00"}
                            </TableCell>

                            {/* السلف */}
                            <TableCell className="text-center whitespace-nowrap font-medium text-amber-600">
                              {Number(rec.advances) > 0 ? `-${formatAmount(rec.advances)}` : "0.00"}
                            </TableCell>

                            {/* ملاحظات */}
                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                              {rec.notes || "—"}
                            </TableCell>

                            {/* الإجراءات */}
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEditRecord(rec)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => setDeletingRecordId(rec.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog: Add Worker */}
      <Dialog open={showAddWorkerDialog} onOpenChange={setShowAddWorkerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workers.addWorker}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorker} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-name">اسم العامل *</Label>
              <Input id="w-name" name="name" required placeholder="مثال: محمد أحمد" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-job">الوظيفة / الصنعة</Label>
              <Input id="w-job" name="job_title" placeholder="مثال: نجار، فني تجميع، مساعد" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-salary">المرتب الشهري الأساسي (على أساس 270 ساعة) *</Label>
              <Input
                id="w-salary"
                name="monthly_salary"
                type="number"
                step="0.01"
                required
                placeholder="6000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-phone">رقم الهاتف</Label>
              <Input id="w-phone" name="phone" placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-notes">ملاحظات</Label>
              <Textarea id="w-notes" name="notes" rows={2} placeholder="أي ملاحظات إضافية..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddWorkerDialog(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                حفظ العامل
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Worker */}
      <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workers.editWorker}</DialogTitle>
          </DialogHeader>
          {editingWorker && (
            <form onSubmit={handleUpdateWorker} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ew-name">اسم العامل *</Label>
                <Input id="ew-name" name="name" defaultValue={editingWorker.name} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ew-job">الوظيفة / الصنعة</Label>
                <Input id="ew-job" name="job_title" defaultValue={editingWorker.job_title ?? ""} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ew-salary">المرتب الشهري الأساسي (على أساس 270 ساعة) *</Label>
                <Input
                  id="ew-salary"
                  name="monthly_salary"
                  type="number"
                  step="0.01"
                  defaultValue={editingWorker.monthly_salary}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ew-phone">رقم الهاتف</Label>
                <Input
                  id="ew-phone"
                  name="phone"
                  defaultValue={editingWorker.phone ?? ""}
                  dir="ltr"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ew-notes">ملاحظات</Label>
                <Textarea
                  id="ew-notes"
                  name="notes"
                  rows={2}
                  defaultValue={editingWorker.notes ?? ""}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingWorker(null)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Worker Confirm */}
      <Dialog
        open={!!deletingWorkerId}
        onOpenChange={() => setDeletingWorkerId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف العامل</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t.workers.deleteWorkerConfirm}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingWorkerId(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorker}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              حذف العامل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Attendance / Time / Salary Record */}
      <Dialog open={showAddRecordDialog} onOpenChange={setShowAddRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل حضور وانصراف - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRecord} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-date">التاريخ *</Label>
              <Input
                id="r-date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Check-in & Departure Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-checkin" className="text-xs font-semibold">معاد الحضور</Label>
                <Input
                  id="r-checkin"
                  value={addCheckIn}
                  onChange={(e) => handleAddCheckInChange(e.target.value)}
                  placeholder="08:00 ص"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-departure" className="text-xs font-semibold">معاد الانصراف</Label>
                <Input
                  id="r-departure"
                  value={addDeparture}
                  onChange={(e) => handleAddDepartureChange(e.target.value)}
                  placeholder="05:00 م"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-hours" className="text-xs font-semibold text-primary">ساعات العمل (محسوبة)</Label>
                <Input
                  id="r-hours"
                  type="number"
                  step="0.1"
                  value={addHours}
                  onChange={(e) => setAddHours(Number(e.target.value) || 0)}
                  className="font-bold text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="r-delay">التأخير</Label>
                <Input id="r-delay" name="delay" placeholder="مثال: 30 دقيقة / لا يوجد" defaultValue="لا يوجد" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="r-deduction">الخصم (L.E)</Label>
                <Input
                  id="r-deduction"
                  name="deduction"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="r-advances">السلف (L.E)</Label>
                <Input
                  id="r-advances"
                  name="advances"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="r-notes">ملاحظات / سبب الخصم أو السلفة</Label>
              <Input id="r-notes" name="notes" placeholder="ملاحظة..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddRecordDialog(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                حفظ السجل
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Record */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل سجل الحضور والانصراف - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <form onSubmit={handleUpdateRecord} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="er-date">التاريخ *</Label>
                <Input
                  id="er-date"
                  name="date"
                  type="date"
                  required
                  defaultValue={editingRecord.date}
                />
              </div>

              {/* Check-in & Departure Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="er-checkin" className="text-xs font-semibold">معاد الحضور</Label>
                  <Input
                    id="er-checkin"
                    value={editCheckIn}
                    onChange={(e) => handleEditCheckInChange(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="er-departure" className="text-xs font-semibold">معاد الانصراف</Label>
                  <Input
                    id="er-departure"
                    value={editDeparture}
                    onChange={(e) => handleEditDepartureChange(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="er-hours" className="text-xs font-semibold text-primary">ساعات العمل</Label>
                  <Input
                    id="er-hours"
                    type="number"
                    step="0.1"
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value) || 0)}
                    className="font-bold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="er-delay">التأخير</Label>
                  <Input id="er-delay" name="delay" defaultValue={editingRecord.delay} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="er-deduction">الخصم (L.E)</Label>
                  <Input
                    id="er-deduction"
                    name="deduction"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord.deduction}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="er-advances">السلف (L.E)</Label>
                  <Input
                    id="er-advances"
                    name="advances"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord.advances}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="er-notes">ملاحظات</Label>
                <Input
                  id="er-notes"
                  name="notes"
                  defaultValue={editingRecord.notes ?? ""}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Record Confirm */}
      <Dialog
        open={!!deletingRecordId}
        onOpenChange={() => setDeletingRecordId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف السجل</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t.workers.deleteRecordConfirm}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingRecordId(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecord}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              حذف السجل
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
