"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePermissions } from "@/hooks/usePermissions";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/utils/cn";

const menus = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard", permission: "dashboard:view" },
  { icon: "👥", label: "ลูกค้า", href: "/customers", permission: "customers:view" },
  { icon: "📅", label: "งานประจำเดือน", href: "/workflow", permission: "workflow:view" },
  { icon: "📑", label: "ภาษี", href: "/tax", permission: "tax:view" },
  { icon: "📂", label: "เอกสาร", href: "/documents", permission: "documents:view" },
  { icon: "💰", label: "การเงิน", href: "/finance", permission: "finance:view" },
  { icon: "📊", label: "รายงาน", href: "/reports", permission: "reports:view" },
  { icon: "👨‍💼", label: "พนักงาน", href: "/employees", permission: "employees:view" },
  { icon: "⚙️", label: "ตั้งค่า", href: "/settings", permission: "settings:view" },
];

const SIDEBAR_COOKIE_NAME = "sidebar_collapsed";

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const visibleMenus = menus.filter((menu) => hasPermission(menu.permission));

  return (
    <nav className="space-y-2">
      {visibleMenus.map((menu) => (
        <Link
          key={menu.href}
          href={menu.href}
          onClick={onNavigate}
          title={collapsed ? menu.label : undefined}
          className={cn(
            "block rounded-lg px-4 py-3 transition",
            collapsed && "text-center text-lg",
            pathname === menu.href ? "bg-blue-600" : "hover:bg-slate-700"
          )}
        >
          {collapsed ? menu.icon : `${menu.icon} ${menu.label}`}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar({
  initialCollapsed = false,
}: {
  initialCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-3 text-white md:hidden">
        <span className="text-lg font-bold">📊 AccOffice</span>
        <div className="flex items-center gap-1">
          <NotificationBell className="text-white hover:bg-slate-800" />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-slate-800"
                />
              }
            >
              <ListIcon />
              <span className="sr-only">เปิดเมนู</span>
            </SheetTrigger>
            <SheetContent side="left" className="bg-slate-900 text-white">
              <SheetTitle className="p-4 text-white">📊 AccOffice</SheetTitle>
              <div className="px-4 pb-4">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <aside
        className={cn(
          "hidden min-h-screen flex-col bg-slate-900 p-5 text-white transition-all duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          {!collapsed && <h1 className="text-2xl font-bold">📊 AccOffice</h1>}
          <div className="flex items-center gap-1">
            <NotificationBell className="text-white hover:bg-slate-800" />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-slate-800"
              onClick={toggleCollapsed}
            >
              <SidebarSimpleIcon />
              <span className="sr-only">พับ/ขยายเมนู</span>
            </Button>
          </div>
        </div>
        <SidebarNav collapsed={collapsed} />
      </aside>
    </>
  );
}