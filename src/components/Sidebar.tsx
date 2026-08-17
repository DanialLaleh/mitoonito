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
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="mb-6 px-2">
        <img
          src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
          alt="میتونی‌تو"
          className="h-16 w-auto mb-2"
        />
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          سلام، {userName}
        </p>
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
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle />

      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 text-right w-full"
        >
          خروج از حساب
        </button>
      </form>
    </aside>
  );
}
