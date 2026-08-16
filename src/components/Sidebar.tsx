"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  ListTodo,
  Repeat,
  Target,
  Layers,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const items = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/today", label: "امروز", icon: CalendarCheck },
  { href: "/tasks", label: "وظایف", icon: ListTodo },
  { href: "/habits", label: "عادت‌ها", icon: Repeat },
  { href: "/goals", label: "اهداف", icon: Target },
  { href: "/areas", label: "حوزه‌ها", icon: Layers },
  { href: "/finances", label: "مالی", icon: Wallet },
  { href: "/reminders", label: "یادآورها", icon: Bell },
  { href: "/settings", label: "تنظیمات", icon: Settings },
];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-l border-gray-100 bg-white p-4">
      <div className="mb-6 px-2">
        <p className="font-bold text-lg text-green-700">میتونی‌تو</p>
        <p className="text-sm text-gray-400 mt-1">سلام، {userName}</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm text-gray-400 hover:text-red-600 px-3 py-2 text-right w-full"
        >
          خروج از حساب
        </button>
      </form>
    </aside>
  );
}
