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
import { cn } from "@/utils/cn";

const menus = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "👥", label: "ลูกค้า", href: "/customers" },
  { icon: "📅", label: "งานประจำเดือน", href: "/workflow" },
  { icon: "📑", label: "ภาษี", href: "/tax" },
  { icon: "📂", label: "เอกสาร", href: "/documents" },
  { icon: "💰", label: "การเงิน", href: "/finance" },
  { icon: "📊", label: "รายงาน", href: "/reports" },
  { icon: "👨‍💼", label: "พนักงาน", href: "/employees" },
  { icon: "⚙️", label: "ตั้งค่า", href: "/settings" },
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

  return (
    <nav className="space-y-2">
      {menus.map((menu) => (
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

      <aside
        className={cn(
          "hidden min-h-screen flex-col bg-slate-900 p-5 text-white transition-all duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          {!collapsed && <h1 className="text-2xl font-bold">📊 AccOffice</h1>}
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
        <SidebarNav collapsed={collapsed} />
      </aside>
    </>
  );
}