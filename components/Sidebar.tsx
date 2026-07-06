"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "🏠 Dashboard", href: "/" },
  { name: "👥 ลูกค้า", href: "/customers" },
  { name: "📅 งานประจำเดือน", href: "/workflow" },
  { name: "📑 ภาษี", href: "/tax" },
  { name: "📂 เอกสาร", href: "/documents" },
  { name: "💰 การเงิน", href: "/finance" },
  { name: "📊 รายงาน", href: "/reports" },
  { name: "👨‍💼 พนักงาน", href: "/employees" },
  { name: "⚙️ ตั้งค่า", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">📊 AccOffice</h1>

      <nav className="space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`block rounded-lg px-4 py-3 transition ${
              pathname === menu.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}