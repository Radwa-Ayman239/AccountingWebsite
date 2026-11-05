"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { signOut } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Calculator,
  ShieldCheck,
  Eye,
  HardHat,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  userEmail: string;
  userRole?: UserRole;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { href: "/clients", icon: Users, labelKey: "clients" as const },
  { href: "/transactions", icon: Receipt, labelKey: "transactions" as const },
  { href: "/workers", icon: HardHat, labelKey: "workers" as const },
  { href: "/analytics", icon: BarChart3, labelKey: "analytics" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function AppShell({ children, userEmail, userRole = "viewer" }: AppShellProps) {
  const { t, isRTL, locale } = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitial = userEmail.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Calculator className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-foreground">
            {t.common.appName}
          </span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{t.nav[item.labelKey]}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center px-0"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {userEmail}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                {userRole === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-primary/15 text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {locale === "ar" ? "مسؤول" : "Admin"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {locale === "ar" ? "مشاهد" : "Viewer"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "mt-1 w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            collapsed && "w-9"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.common.logout}</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-e border-sidebar-border bg-sidebar-background transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {sidebarContent}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {(collapsed ? !isRTL : isRTL) ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-64 border-e border-sidebar-border bg-sidebar-background transition-transform duration-300 md:hidden",
          isRTL ? "end-0" : "start-0",
          mobileOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 end-[-44px]">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-bold">{t.common.appName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
