export type TransactionType = "income" | "expense";

export type PaymentStatus = "paid" | "pending" | "overdue";

export type Category =
  | "wood"          // خشب
  | "hinges"        // مفصلات
  | "handles"       // مقابض
  | "dish_racks"    // مطبقيات
  | "trolley"       // ترولي
  | "trash_basket"  // باسكت زبالة
  | "pull_out"      // بول اوت
  | "magic_corner"  // ماجيك
  | "gas_springs"   // بساتم
  | "rent"          // إيجار
  | "utilities"     // كهرباء ومرافق
  | "maintenance"   // صيانة
  | "overhead"      // مصاريف عامة وإدارية
  | "other"         // أخرى
  // Legacy categories
  | "client_supplies"
  | "software"
  | "transport"
  | "services"
  | "materials";

export type ProjectStatus = "active" | "completed" | "delivered" | "on_hold" | "cancelled";

export type Currency = "EGP" | "SAR" | "AED" | "USD" | "EUR";

export type UserRole = "admin" | "viewer";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact_info: string;
  project_status: ProjectStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  expenses?: number;
  revenue?: number;
  pending?: number;
  overdue?: number;
  profit?: number;
  total_invoiced?: number;
  total_expenses?: number;
  net_profit?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  client_id?: string; // Optional or "general" for general expenses
  date: string;
  type: TransactionType;
  category: Category;
  description: string;
  amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface DashboardMetrics {
  totalRevenue: number;         // إجمالي الإيرادات المؤكدة المحصلة
  totalExpenses: number;        // إجمالي كل المصروفات (عملاء + عامة)
  clientExpenses: number;       // مصروفات العملاء (خامات وتوريدات مرتبطة بالعملاء)
  generalExpenses: number;      // المصروفات العامة (إيجار، مرافق، صيانة، نفقات تشغيلية)
  workerSalaries: number;       // رواتب ومستحقات العمال
  actualBudget: number;         // الرصيد الفعلي في الميزانية/الخزينة = الإيرادات - (مصروفات العملاء + المصروفات العامة + رواتب العمال)
  totalOverhead: number;
  netProfit: number;
  totalOverdue: number;
  totalPending: number;
  clientCount: number;
  transactionCount: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
}

export interface ClientProfitability {
  client_id: string;
  client_name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: Currency;
  locale: "ar" | "en";
  theme: "light" | "dark" | "system";
}

export interface Worker {
  id: string;
  user_id?: string;           // معرّف المستخدم المالك
  name: string;               // اسم العامل
  job_title?: string;         // الوظيفة / الصنعة
  monthly_salary: number;     // المرتب الشهري الأساسي (على أساس 270 ساعة)
  phone?: string;             // رقم الهاتف
  notes?: string;             // ملاحظات
  status?: string;            // حالة العامل (active / inactive)
  created_at: string;
  updated_at: string;
}

export interface WorkerAttendance {
  id: string;
  worker_id: string;          // معرّف العامل
  date: string;               // التاريخ (YYYY-MM-DD)
  day: string;                // اليوم (السبت، الأحد، ...)
  check_in_time: string;      // معاد الحضور (e.g. 08:00 ص)
  departure_time?: string;    // معاد الانصراف (e.g. 05:00 م)
  daily_hours?: number;       // إجمالي ساعات العمل في اليوم (e.g. 9)
  delay: string;              // التأخير
  deduction: number;          // الخصم (L.E)
  advances: number;           // السلف (L.E)
  notes?: string;             // ملاحظات
  created_at: string;
  updated_at: string;
}
