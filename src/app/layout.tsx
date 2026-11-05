import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "محاسب - نظام إدارة الحسابات",
  description: "تطبيق متكامل لإدارة الحسابات والمعاملات المالية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            {children}
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
