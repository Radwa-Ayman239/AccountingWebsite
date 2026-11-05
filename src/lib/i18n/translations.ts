export type Locale = "ar" | "en";

export interface TranslationSet {
  common: {
    appName: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    loading: string;
    noData: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    yes: string;
    no: string;
    all: string;
    none: string;
    actions: string;
    status: string;
    details: string;
    summary: string;
    total: string;
    date: string;
    amount: string;
    type: string;
    category: string;
    description: string;
    notes: string;
    name: string;
    email: string;
    phone: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    required: string;
    optional: string;
    selectOption: string;
    noResults: string;
    showMore: string;
    showLess: string;
    exportData: string;
    importData: string;
    refresh: string;
    sortBy: string;
    ascending: string;
    descending: string;
    rowsPerPage: string;
    page: string;
    of: string;
    from: string;
    to: string;
    clearFilters: string;
    applyFilters: string;
    confirmDelete: string;
    deleteMessage: string;
    savedSuccessfully: string;
    deletedSuccessfully: string;
    updatedSuccessfully: string;
    createdSuccessfully: string;
    errorOccurred: string;
    tryAgain: string;
    logout: string;
    profile: string;
    welcome: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    newPassword: string;
    signIn: string;
    signUp: string;
    signOut: string;
    loginTitle: string;
    registerTitle: string;
    loginSubtitle: string;
    registerSubtitle: string;
    noAccount: string;
    hasAccount: string;
    rememberMe: string;
    passwordMismatch: string;
    invalidEmail: string;
    weakPassword: string;
    emailInUse: string;
    invalidCredentials: string;
    fullName: string;
    termsAgree: string;
    termsOfService: string;
    privacyPolicy: string;
    and: string;
    verifyEmail: string;
    verifyEmailMessage: string;
    resetPasswordMessage: string;
    resetPasswordSent: string;
  };
  nav: {
    dashboard: string;
    clients: string;
    transactions: string;
    workers: string;
    analytics: string;
    settings: string;
    overview: string;
  };
  clients: {
    title: string;
    clientName: string;
    contactInfo: string;
    projectStatus: string;
    totalInvoiced: string;
    totalExpenses: string;
    netProfit: string;
    expenses: string;
    revenue: string;
    pending: string;
    overdue: string;
    profit: string;
    addClient: string;
    editClient: string;
    deleteClient: string;
    clientDetails: string;
    clientList: string;
    noClients: string;
    noClientsMessage: string;
    searchClients: string;
    filterByStatus: string;
    active: string;
    completed: string;
    delivered: string;
    onHold: string;
    cancelled: string;
    allStatuses: string;
    clientTransactions: string;
    clientOverview: string;
    revenueFromClient: string;
    expensesForClient: string;
    profitFromClient: string;
    deleteClientConfirm: string;
    deleteClientMessage: string;
    contactInformation: string;
    projectNotes: string;
    createdAt: string;
    updatedAt: string;
    clientCount: string;
  };
  transactions: {
    title: string;
    date: string;
    client: string;
    type: string;
    category: string;
    description: string;
    amount: string;
    paymentStatus: string;
    income: string;
    expense: string;
    paid: string;
    pending: string;
    overdue: string;
    addTransaction: string;
    editTransaction: string;
    deleteTransaction: string;
    transactionDetails: string;
    transactionList: string;
    noTransactions: string;
    noTransactionsMessage: string;
    searchTransactions: string;
    filterByType: string;
    filterByStatus: string;
    filterByCategory: string;
    filterByClient: string;
    filterByDate: string;
    allTypes: string;
    allStatuses: string;
    allCategories: string;
    allClients: string;
    categories: {
      wood: string;
      hinges: string;
      handles: string;
      dish_racks: string;
      trolley: string;
      trash_basket: string;
      pull_out: string;
      magic_corner: string;
      gas_springs: string;
      other: string;
      rent?: string;
      utilities?: string;
      maintenance?: string;
      client_supplies?: string;
      overhead?: string;
      software?: string;
      transport?: string;
      services?: string;
      materials?: string;
    };
    dateRange: string;
    startDate: string;
    endDate: string;
    selectClient: string;
    selectCategory: string;
    selectType: string;
    selectStatus: string;
    deleteTransactionConfirm: string;
    deleteTransactionMessage: string;
    transactionCount: string;
    totalAmount: string;
    recentTransactions: string;
  };
  dashboard: {
    title: string;
    totalRevenue: string;
    totalExpenses: string;
    overhead: string;
    netProfit: string;
    totalOverdue: string;
    totalPending: string;
    monthlyTrends: string;
    expenseBreakdown: string;
    recentTransactions: string;
    clientProfitability: string;
    topClients: string;
    quickActions: string;
    addNewClient: string;
    addNewTransaction: string;
    viewAllTransactions: string;
    viewAllClients: string;
    revenueGrowth: string;
    profitMargin: string;
    clientCount: string;
    transactionCount: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    noDataYet: string;
    noDataYetMessage: string;
    welcomeMessage: string;
    financialOverview: string;
    revenue: string;
    expenses: string;
    profit: string;
    loss: string;
    generalExpenses?: string;
    clientExpenses?: string;
    workerSalaries?: string;
    actualBudget?: string;
    budgetFormula?: string;
    generalExpensesTab?: string;
    actualBudgetTab?: string;
    overviewTab?: string;
  };
  workers: {
    title: string;
    workerList: string;
    addWorker: string;
    editWorker: string;
    deleteWorker: string;
    workerName: string;
    jobTitle: string;
    monthlySalary: string;
    phone: string;
    notes: string;
    attendanceAndSalaries: string;
    addRecord: string;
    editRecord: string;
    deleteRecord: string;
    dayAndDate: string;
    checkInTime: string;
    delay: string;
    deduction: string;
    advances: string;
    netSalary: string;
    totalDeductions: string;
    totalAdvances: string;
    noWorkers: string;
    noWorkersMessage: string;
    noRecords: string;
    noRecordsMessage: string;
    selectWorkerPrompt: string;
    deleteWorkerConfirm: string;
    deleteRecordConfirm: string;
    departureTime?: string;
    dailyHours?: string;
    totalHours?: string;
    standardHours?: string;
    additionalHours?: string;
    grossSalary?: string;
    finalSalary?: string;
  };
  analytics: {
    title: string;
    revenueVsExpenses: string;
    categoryBreakdown: string;
    perClientBreakdown: string;
    monthlyTrend: string;
    topClients: string;
    revenueByClient: string;
    expensesByCategory: string;
    profitByClient: string;
    periodSelector: string;
    last30Days: string;
    last90Days: string;
    last6Months: string;
    lastYear: string;
    allTime: string;
    customRange: string;
    exportReport: string;
    totalIncome: string;
    totalExpenses: string;
    netResult: string;
    averageTransaction: string;
    largestTransaction: string;
    transactionVolume: string;
    profitTrend: string;
    growthRate: string;
    comparedToPrevious: string;
    increase: string;
    decrease: string;
    noChange: string;
  };
  settings: {
    title: string;
    theme: string;
    language: string;
    currency: string;
    darkMode: string;
    lightMode: string;
    systemMode: string;
    appearance: string;
    preferences: string;
    account: string;
    general: string;
    selectCurrency: string;
    selectLanguage: string;
    selectTheme: string;
    arabic: string;
    english: string;
    savedSuccessfully: string;
    currencies: {
      EGP: string;
      SAR: string;
      AED: string;
      USD: string;
      EUR: string;
    };
    dangerZone: string;
    deleteAccount: string;
    deleteAccountMessage: string;
    exportAllData: string;
    changePassword: string;
    updateProfile: string;
  };
}

const translations: Record<Locale, TranslationSet> = {
  ar: {
    common: {
      appName: "محاسب",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      search: "بحث",
      filter: "تصفية",
      loading: "جاري التحميل...",
      noData: "لا توجد بيانات",
      confirm: "تأكيد",
      close: "إغلاق",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      submit: "إرسال",
      reset: "إعادة تعيين",
      yes: "نعم",
      no: "لا",
      all: "الكل",
      none: "لا شيء",
      actions: "إجراءات",
      status: "الحالة",
      details: "التفاصيل",
      summary: "الملخص",
      total: "الإجمالي",
      date: "التاريخ",
      amount: "المبلغ",
      type: "النوع",
      category: "الفئة",
      description: "الوصف",
      notes: "ملاحظات",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      error: "خطأ",
      success: "نجاح",
      warning: "تحذير",
      info: "معلومات",
      required: "مطلوب",
      optional: "اختياري",
      selectOption: "اختر خياراً",
      noResults: "لا توجد نتائج",
      showMore: "عرض المزيد",
      showLess: "عرض أقل",
      exportData: "تصدير البيانات",
      importData: "استيراد البيانات",
      refresh: "تحديث",
      sortBy: "ترتيب حسب",
      ascending: "تصاعدي",
      descending: "تنازلي",
      rowsPerPage: "صفوف لكل صفحة",
      page: "صفحة",
      of: "من",
      from: "من",
      to: "إلى",
      clearFilters: "مسح الفلاتر",
      applyFilters: "تطبيق الفلاتر",
      confirmDelete: "تأكيد الحذف",
      deleteMessage: "هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
      savedSuccessfully: "تم الحفظ بنجاح",
      deletedSuccessfully: "تم الحذف بنجاح",
      updatedSuccessfully: "تم التحديث بنجاح",
      createdSuccessfully: "تم الإنشاء بنجاح",
      errorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      tryAgain: "حاول مرة أخرى",
      logout: "تسجيل الخروج",
      profile: "الملف الشخصي",
      welcome: "مرحباً",
    },
    auth: {
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      resetPassword: "إعادة تعيين كلمة المرور",
      newPassword: "كلمة المرور الجديدة",
      signIn: "دخول",
      signUp: "تسجيل",
      signOut: "خروج",
      loginTitle: "تسجيل الدخول إلى حسابك",
      registerTitle: "إنشاء حساب جديد",
      loginSubtitle: "أدخل بريدك الإلكتروني وكلمة المرور للدخول",
      registerSubtitle: "أنشئ حساباً جديداً للبدء في إدارة حساباتك",
      noAccount: "ليس لديك حساب؟",
      hasAccount: "لديك حساب بالفعل؟",
      rememberMe: "تذكرني",
      passwordMismatch: "كلمتا المرور غير متطابقتين",
      invalidEmail: "بريد إلكتروني غير صالح",
      weakPassword: "كلمة المرور ضعيفة. يجب أن تكون 8 أحرف على الأقل.",
      emailInUse: "هذا البريد الإلكتروني مستخدم بالفعل",
      invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صحيحة",
      fullName: "الاسم الكامل",
      termsAgree: "أوافق على",
      termsOfService: "شروط الخدمة",
      privacyPolicy: "سياسة الخصوصية",
      and: "و",
      verifyEmail: "تحقق من بريدك الإلكتروني",
      verifyEmailMessage: "تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.",
      resetPasswordMessage: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.",
      resetPasswordSent: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
    },
    nav: {
      dashboard: "لوحة التحكم",
      clients: "العملاء",
      transactions: "المعاملات",
      workers: "العمال والرواتب",
      analytics: "التحليلات",
      settings: "الإعدادات",
      overview: "نظرة عامة",
    },
    clients: {
      title: "العملاء",
      clientName: "اسم العميل",
      contactInfo: "معلومات الاتصال",
      projectStatus: "حالة المشروع",
      totalInvoiced: "إجمالي الفواتير",
      totalExpenses: "إجمالي المصروفات",
      netProfit: "إجمالي الربح",
      expenses: "المصروفات",
      revenue: "الإيرادات",
      pending: "المعلق",
      overdue: "المتأخر",
      profit: "إجمالي الربح",
      addClient: "إضافة عميل",
      editClient: "تعديل العميل",
      deleteClient: "حذف العميل",
      clientDetails: "تفاصيل العميل",
      clientList: "قائمة العملاء",
      noClients: "لا يوجد عملاء",
      noClientsMessage: "لم تقم بإضافة أي عملاء بعد. ابدأ بإضافة عميلك الأول.",
      searchClients: "البحث عن عملاء...",
      filterByStatus: "تصفية حسب الحالة",
      active: "نشط",
      completed: "مكتمل",
      delivered: "تم التسليم",
      onHold: "معلق",
      cancelled: "ملغي",
      allStatuses: "جميع الحالات",
      clientTransactions: "معاملات العميل",
      clientOverview: "نظرة عامة على العميل",
      revenueFromClient: "الإيرادات من العميل",
      expensesForClient: "المصروفات للعميل",
      profitFromClient: "الربح من العميل",
      deleteClientConfirm: "تأكيد حذف العميل",
      deleteClientMessage: "هل أنت متأكد من أنك تريد حذف هذا العميل؟ سيتم حذف جميع المعاملات المرتبطة به.",
      contactInformation: "معلومات الاتصال",
      projectNotes: "ملاحظات المشروع",
      createdAt: "تاريخ الإنشاء",
      updatedAt: "آخر تحديث",
      clientCount: "عدد العملاء",
    },
    transactions: {
      title: "المعاملات",
      date: "التاريخ",
      client: "العميل",
      type: "النوع",
      category: "الفئة",
      description: "الوصف",
      amount: "المبلغ",
      paymentStatus: "حالة الدفع",
      income: "إيراد",
      expense: "مصروف",
      paid: "مدفوع",
      pending: "معلق",
      overdue: "متأخر",
      addTransaction: "إضافة معاملة",
      editTransaction: "تعديل المعاملة",
      deleteTransaction: "حذف المعاملة",
      transactionDetails: "تفاصيل المعاملة",
      transactionList: "قائمة المعاملات",
      noTransactions: "لا توجد معاملات",
      noTransactionsMessage: "لم تقم بإضافة أي معاملات بعد. ابدأ بإضافة معاملتك الأولى.",
      searchTransactions: "البحث في المعاملات...",
      filterByType: "تصفية حسب النوع",
      filterByStatus: "تصفية حسب الحالة",
      filterByCategory: "تصفية حسب الفئة",
      filterByClient: "تصفية حسب العميل",
      filterByDate: "تصفية حسب التاريخ",
      allTypes: "جميع الأنواع",
      allStatuses: "جميع الحالات",
      allCategories: "جميع الفئات",
      allClients: "جميع العملاء",
      categories: {
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
        rent: "إيجار",
        utilities: "كهرباء ومرافق",
        maintenance: "صيانة",
        overhead: "مصاريف عامة وإدارية",
        client_supplies: "مستلزمات العميل",
        software: "برمجيات",
        transport: "نقل",
        services: "خدمات",
        materials: "مواد",
      },
      dateRange: "نطاق التاريخ",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      selectClient: "اختر العميل",
      selectCategory: "اختر الفئة",
      selectType: "اختر النوع",
      selectStatus: "اختر الحالة",
      deleteTransactionConfirm: "تأكيد حذف المعاملة",
      deleteTransactionMessage: "هل أنت متأكد من أنك تريد حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
      transactionCount: "عدد المعاملات",
      totalAmount: "المبلغ الإجمالي",
      recentTransactions: "أحدث المعاملات",
    },
    dashboard: {
      title: "لوحة التحكم",
      totalRevenue: "إجمالي الإيرادات (المؤكدة)",
      totalExpenses: "إجمالي المصروفات (المؤكدة)",
      overhead: "المصاريف العامة",
      netProfit: "صافي الربح",
      totalOverdue: "إجمالي المبالغ المتأخرة",
      totalPending: "إجمالي المبالغ المعلقة",
      monthlyTrends: "الاتجاهات الشهرية",
      expenseBreakdown: "توزيع المصروفات",
      recentTransactions: "أحدث المعاملات",
      clientProfitability: "ربحية العملاء",
      topClients: "أفضل العملاء",
      quickActions: "إجراءات سريعة",
      addNewClient: "إضافة عميل جديد",
      addNewTransaction: "إضافة معاملة جديدة",
      viewAllTransactions: "عرض جميع المعاملات",
      viewAllClients: "عرض جميع العملاء",
      revenueGrowth: "نمو الإيرادات",
      profitMargin: "هامش الربح",
      clientCount: "عدد العملاء",
      transactionCount: "عدد المعاملات",
      thisMonth: "هذا الشهر",
      lastMonth: "الشهر الماضي",
      thisYear: "هذا العام",
      noDataYet: "لا توجد بيانات بعد",
      noDataYetMessage: "ابدأ بإضافة عملاء ومعاملات لرؤية لوحة التحكم الخاصة بك.",
      welcomeMessage: "مرحباً بك في لوحة التحكم",
      financialOverview: "نظرة مالية عامة",
      revenue: "الإيرادات",
      expenses: "المصروفات",
      profit: "ربح",
      loss: "خسارة",
      generalExpenses: "المصروفات العامة (إيجار، مرافق، صيانة)",
      clientExpenses: "مصروفات العملاء",
      workerSalaries: "رواتب ومستحقات العمال",
      actualBudget: "الرصيد الفعلي في الخزينة / الميزانية",
      budgetFormula: "الإيرادات الفعلية - (مصروفات العملاء + المصروفات العامة + رواتب العمال)",
      generalExpensesTab: "المصروفات العامة والتشغيلية",
      actualBudgetTab: "الرصيد الفعلي في الميزانية",
      overviewTab: "نظرة عامة والتحليلات",
    },
    workers: {
      title: "العمال والرواتب",
      workerList: "قائمة العمال",
      addWorker: "إضافة عامل جديد",
      editWorker: "تعديل بيانات العامل",
      deleteWorker: "حذف العامل",
      workerName: "اسم العامل",
      jobTitle: "الوظيفة / الصنعة",
      monthlySalary: "المرتب الشهري",
      phone: "رقم الهاتف",
      notes: "ملاحظات",
      attendanceAndSalaries: "سجل الحضور والخصومات والسلف",
      addRecord: "تسجيل حضور / سلفة / خصم",
      editRecord: "تعديل السجل",
      deleteRecord: "حذف السجل",
      dayAndDate: "اليوم والتاريخ للحضور",
      checkInTime: "معاد الحضور",
      departureTime: "معاد الانصراف",
      dailyHours: "ساعات العمل اليومية",
      totalHours: "إجمالي ساعات العمل المسجلة",
      standardHours: "الساعات الأساسية (270 ساعة)",
      additionalHours: "ساعات إضافية",
      grossSalary: "الراتب قبل الخصم (حسب الساعات)",
      finalSalary: "صافي الراتب النهائي المستحق",
      delay: "التأخير",
      deduction: "الخصم",
      advances: "السلف",
      netSalary: "صافي المستحق",
      totalDeductions: "إجمالي الخصومات",
      totalAdvances: "إجمالي السلف",
      noWorkers: "لا يوجد عمال مسجلين",
      noWorkersMessage: "لم تقم بإضافة أي عمال بعد. اضغط على إضافة عامل جديد للبدء.",
      noRecords: "لا توجد سجلات حضور",
      noRecordsMessage: "لا توجد سجلات حضور أو سلف أو خصومات مسجلة لهذا العامل بعد.",
      selectWorkerPrompt: "يرجى اختيار عامل من القائمة لعرض سجل الحضور والرواتب الخاص به",
      deleteWorkerConfirm: "هل أنت متأكد من حذف هذا العامل؟ سيتم حذف جميع سجلاته المرتبطة.",
      deleteRecordConfirm: "هل أنت متأكد من حذف هذا السجل؟",
    },
    analytics: {
      title: "التحليلات",
      revenueVsExpenses: "الإيرادات مقابل المصروفات",
      categoryBreakdown: "توزيع حسب الفئة",
      perClientBreakdown: "توزيع حسب العميل",
      monthlyTrend: "الاتجاه الشهري",
      topClients: "أفضل العملاء",
      revenueByClient: "الإيرادات حسب العميل",
      expensesByCategory: "المصروفات حسب الفئة",
      profitByClient: "الربح حسب العميل",
      periodSelector: "اختيار الفترة",
      last30Days: "آخر 30 يوم",
      last90Days: "آخر 90 يوم",
      last6Months: "آخر 6 أشهر",
      lastYear: "العام الماضي",
      allTime: "كل الوقت",
      customRange: "نطاق مخصص",
      exportReport: "تصدير التقرير",
      totalIncome: "إجمالي الدخل",
      totalExpenses: "إجمالي المصروفات",
      netResult: "الناتج الصافي",
      averageTransaction: "متوسط المعاملة",
      largestTransaction: "أكبر معاملة",
      transactionVolume: "حجم المعاملات",
      profitTrend: "اتجاه الربح",
      growthRate: "معدل النمو",
      comparedToPrevious: "مقارنة بالفترة السابقة",
      increase: "زيادة",
      decrease: "انخفاض",
      noChange: "لا تغيير",
    },
    settings: {
      title: "الإعدادات",
      theme: "المظهر",
      language: "اللغة",
      currency: "العملة",
      darkMode: "الوضع الداكن",
      lightMode: "الوضع الفاتح",
      systemMode: "وضع النظام",
      appearance: "المظهر",
      preferences: "التفضيلات",
      account: "الحساب",
      general: "عام",
      selectCurrency: "اختر العملة",
      selectLanguage: "اختر اللغة",
      selectTheme: "اختر المظهر",
      arabic: "العربية",
      english: "الإنجليزية",
      savedSuccessfully: "تم حفظ الإعدادات بنجاح",
      currencies: {
        EGP: "جنيه مصري (L.E)",
        SAR: "ريال سعودي (SAR)",
        AED: "درهم إماراتي (AED)",
        USD: "دولار أمريكي (USD)",
        EUR: "يورو (EUR)",
      },
      dangerZone: "منطقة الخطر",
      deleteAccount: "حذف الحساب",
      deleteAccountMessage: "حذف الحساب نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك.",
      exportAllData: "تصدير جميع البيانات",
      changePassword: "تغيير كلمة المرور",
      updateProfile: "تحديث الملف الشخصي",
    },
  },
  en: {
    common: {
      appName: "Mohaseb",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      noData: "No data available",
      confirm: "Confirm",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      reset: "Reset",
      yes: "Yes",
      no: "No",
      all: "All",
      none: "None",
      actions: "Actions",
      status: "Status",
      details: "Details",
      summary: "Summary",
      total: "Total",
      date: "Date",
      amount: "Amount",
      type: "Type",
      category: "Category",
      description: "Description",
      notes: "Notes",
      name: "Name",
      email: "Email",
      phone: "Phone",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
      required: "Required",
      optional: "Optional",
      selectOption: "Select an option",
      noResults: "No results found",
      showMore: "Show more",
      showLess: "Show less",
      exportData: "Export Data",
      importData: "Import Data",
      refresh: "Refresh",
      sortBy: "Sort by",
      ascending: "Ascending",
      descending: "Descending",
      rowsPerPage: "Rows per page",
      page: "Page",
      of: "of",
      from: "From",
      to: "To",
      clearFilters: "Clear Filters",
      applyFilters: "Apply Filters",
      confirmDelete: "Confirm Delete",
      deleteMessage: "Are you sure you want to delete this item? This action cannot be undone.",
      savedSuccessfully: "Saved successfully",
      deletedSuccessfully: "Deleted successfully",
      updatedSuccessfully: "Updated successfully",
      createdSuccessfully: "Created successfully",
      errorOccurred: "An error occurred. Please try again.",
      tryAgain: "Try again",
      logout: "Logout",
      profile: "Profile",
      welcome: "Welcome",
    },
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset Password",
      newPassword: "New Password",
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      loginTitle: "Sign in to your account",
      registerTitle: "Create a new account",
      loginSubtitle: "Enter your email and password to sign in",
      registerSubtitle: "Create an account to start managing your finances",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      rememberMe: "Remember me",
      passwordMismatch: "Passwords do not match",
      invalidEmail: "Invalid email address",
      weakPassword: "Password is too weak. Must be at least 8 characters.",
      emailInUse: "This email is already in use",
      invalidCredentials: "Invalid email or password",
      fullName: "Full Name",
      termsAgree: "I agree to the",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      and: "and",
      verifyEmail: "Verify your email",
      verifyEmailMessage: "A verification link has been sent to your email. Please check your inbox.",
      resetPasswordMessage: "Enter your email and we'll send you a password reset link.",
      resetPasswordSent: "A password reset link has been sent to your email.",
    },
    nav: {
      dashboard: "Dashboard",
      clients: "Clients",
      transactions: "Transactions",
      workers: "Workers & Salaries",
      analytics: "Analytics",
      settings: "Settings",
      overview: "Overview",
    },
    clients: {
      title: "Clients",
      clientName: "Client Name",
      contactInfo: "Contact Info",
      projectStatus: "Project Status",
      totalInvoiced: "Total Invoiced",
      totalExpenses: "Total Expenses",
      netProfit: "Total Profit",
      expenses: "Expenses",
      revenue: "Revenue",
      pending: "Pending",
      overdue: "Overdue",
      profit: "Total Profit",
      addClient: "Add Client",
      editClient: "Edit Client",
      deleteClient: "Delete Client",
      clientDetails: "Client Details",
      clientList: "Client List",
      noClients: "No Clients",
      noClientsMessage: "You haven't added any clients yet. Start by adding your first client.",
      searchClients: "Search clients...",
      filterByStatus: "Filter by status",
      active: "Active",
      completed: "Completed",
      delivered: "Delivered",
      onHold: "On Hold",
      cancelled: "Cancelled",
      allStatuses: "All Statuses",
      clientTransactions: "Client Transactions",
      clientOverview: "Client Overview",
      revenueFromClient: "Revenue from Client",
      expensesForClient: "Expenses for Client",
      profitFromClient: "Profit from Client",
      deleteClientConfirm: "Confirm Delete Client",
      deleteClientMessage: "Are you sure you want to delete this client? All associated transactions will be deleted.",
      contactInformation: "Contact Information",
      projectNotes: "Project Notes",
      createdAt: "Created At",
      updatedAt: "Last Updated",
      clientCount: "Client Count",
    },
    transactions: {
      title: "Transactions",
      date: "Date",
      client: "Client",
      type: "Type",
      category: "Category",
      description: "Description",
      amount: "Amount",
      paymentStatus: "Payment Status",
      income: "Income",
      expense: "Expense",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
      addTransaction: "Add Transaction",
      editTransaction: "Edit Transaction",
      deleteTransaction: "Delete Transaction",
      transactionDetails: "Transaction Details",
      transactionList: "Transaction List",
      noTransactions: "No Transactions",
      noTransactionsMessage: "You haven't added any transactions yet. Start by adding your first transaction.",
      searchTransactions: "Search transactions...",
      filterByType: "Filter by type",
      filterByStatus: "Filter by status",
      filterByCategory: "Filter by category",
      filterByClient: "Filter by client",
      filterByDate: "Filter by date",
      allTypes: "All Types",
      allStatuses: "All Statuses",
      allCategories: "All Categories",
      allClients: "All Clients",
      categories: {
        wood: "Wood",
        hinges: "Hinges",
        handles: "Handles",
        dish_racks: "Dish Racks",
        trolley: "Trolley",
        trash_basket: "Trash Basket",
        pull_out: "Pull Out",
        magic_corner: "Magic Corner",
        gas_springs: "Gas Springs / Pistons",
        other: "Other",
        rent: "Rent",
        utilities: "Electricity & Utilities",
        maintenance: "Maintenance",
        client_supplies: "Client Supplies",
        overhead: "Overhead",
        software: "Software",
        transport: "Transport",
        services: "Services",
        materials: "Materials",
      },
      dateRange: "Date Range",
      startDate: "Start Date",
      endDate: "End Date",
      selectClient: "Select Client",
      selectCategory: "Select Category",
      selectType: "Select Type",
      selectStatus: "Select Status",
      deleteTransactionConfirm: "Confirm Delete Transaction",
      deleteTransactionMessage: "Are you sure you want to delete this transaction? This action cannot be undone.",
      transactionCount: "Transaction Count",
      totalAmount: "Total Amount",
      recentTransactions: "Recent Transactions",
    },
    dashboard: {
      title: "Dashboard",
      totalRevenue: "Confirmed Revenue",
      totalExpenses: "Confirmed Expenses",
      overhead: "Overhead",
      netProfit: "Net Profit",
      totalOverdue: "Total Overdue",
      totalPending: "Total Pending",
      monthlyTrends: "Monthly Trends",
      expenseBreakdown: "Expense Breakdown",
      recentTransactions: "Recent Transactions",
      clientProfitability: "Client Profitability",
      topClients: "Top Clients",
      quickActions: "Quick Actions",
      addNewClient: "Add New Client",
      addNewTransaction: "Add New Transaction",
      viewAllTransactions: "View All Transactions",
      viewAllClients: "View All Clients",
      revenueGrowth: "Revenue Growth",
      profitMargin: "Profit Margin",
      clientCount: "Client Count",
      transactionCount: "Transaction Count",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      thisYear: "This Year",
      noDataYet: "No Data Yet",
      noDataYetMessage: "Start by adding clients and transactions to see your dashboard.",
      welcomeMessage: "Welcome to your dashboard",
      financialOverview: "Financial Overview",
      revenue: "Revenue",
      expenses: "Expenses",
      profit: "Profit",
      loss: "Loss",
      generalExpenses: "General Expenses (Rent, Utilities, Maintenance)",
      clientExpenses: "Client Expenses",
      workerSalaries: "Worker Salaries",
      actualBudget: "Actual Money in Budget / Cash",
      budgetFormula: "Actual Income - (Client Expenses + General Expenses + Worker Salaries)",
      generalExpensesTab: "General Expenses",
      actualBudgetTab: "Actual Budget & Cash",
      overviewTab: "Overview & Analytics",
    },
    workers: {
      title: "Workers & Salaries",
      workerList: "Workers List",
      addWorker: "Add New Worker",
      editWorker: "Edit Worker",
      deleteWorker: "Delete Worker",
      workerName: "Worker Name",
      jobTitle: "Job / Craft",
      monthlySalary: "Monthly Salary",
      phone: "Phone Number",
      notes: "Notes",
      attendanceAndSalaries: "Attendance, Deductions & Advances Record",
      addRecord: "Record Attendance / Advance / Deduction",
      editRecord: "Edit Record",
      deleteRecord: "Delete Record",
      dayAndDate: "Day & Date of Attendance",
      checkInTime: "Check-in Time",
      departureTime: "Departure Time",
      dailyHours: "Daily Hours",
      totalHours: "Total Hours Worked",
      standardHours: "Standard Hours (270h)",
      additionalHours: "Overtime Hours",
      grossSalary: "Salary Before Deductions",
      finalSalary: "Final Net Salary Due",
      delay: "Delay",
      deduction: "Deduction",
      advances: "Advances",
      netSalary: "Net Due",
      totalDeductions: "Total Deductions",
      totalAdvances: "Total Advances",
      noWorkers: "No Workers Registered",
      noWorkersMessage: "You haven't added any workers yet. Click Add New Worker to begin.",
      noRecords: "No Attendance Records",
      noRecordsMessage: "No attendance, advance, or deduction records found for this worker yet.",
      selectWorkerPrompt: "Please select a worker from the list to view their attendance and salary records.",
      deleteWorkerConfirm: "Are you sure you want to delete this worker? All their records will be deleted.",
      deleteRecordConfirm: "Are you sure you want to delete this record?",
    },
    analytics: {
      title: "Analytics",
      revenueVsExpenses: "Revenue vs Expenses",
      categoryBreakdown: "Category Breakdown",
      perClientBreakdown: "Per-Client Breakdown",
      monthlyTrend: "Monthly Trend",
      topClients: "Top Clients",
      revenueByClient: "Revenue by Client",
      expensesByCategory: "Expenses by Category",
      profitByClient: "Profit by Client",
      periodSelector: "Period Selector",
      last30Days: "Last 30 Days",
      last90Days: "Last 90 Days",
      last6Months: "Last 6 Months",
      lastYear: "Last Year",
      allTime: "All Time",
      customRange: "Custom Range",
      exportReport: "Export Report",
      totalIncome: "Total Income",
      totalExpenses: "Total Expenses",
      netResult: "Net Result",
      averageTransaction: "Average Transaction",
      largestTransaction: "Largest Transaction",
      transactionVolume: "Transaction Volume",
      profitTrend: "Profit Trend",
      growthRate: "Growth Rate",
      comparedToPrevious: "Compared to previous period",
      increase: "Increase",
      decrease: "Decrease",
      noChange: "No Change",
    },
    settings: {
      title: "Settings",
      theme: "Theme",
      language: "Language",
      currency: "Currency",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      systemMode: "System",
      appearance: "Appearance",
      preferences: "Preferences",
      account: "Account",
      general: "General",
      selectCurrency: "Select Currency",
      selectLanguage: "Select Language",
      selectTheme: "Select Theme",
      arabic: "Arabic",
      english: "English",
      savedSuccessfully: "Settings saved successfully",
      currencies: {
        EGP: "Egyptian Pound (L.E)",
        SAR: "Saudi Riyal (SAR)",
        AED: "UAE Dirham (AED)",
        USD: "US Dollar (USD)",
        EUR: "Euro (EUR)",
      },
      dangerZone: "Danger Zone",
      deleteAccount: "Delete Account",
      deleteAccountMessage: "Deleting your account is permanent and cannot be undone. All your data will be deleted.",
      exportAllData: "Export All Data",
      changePassword: "Change Password",
      updateProfile: "Update Profile",
    },
  },
};

/**
 * Get the translation set for the given locale.
 */
export function getTranslations(locale: Locale): TranslationSet {
  return translations[locale];
}

/**
 * Get a nested translation value using dot notation.
 * Example: t("common.save") => "حفظ"
 */
export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let result: unknown = translations[locale];

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof result === "string" ? result : key;
}

export { translations };
