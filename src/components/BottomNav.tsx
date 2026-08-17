"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Repeat,
  CalendarCheck,
  Menu,
} from "lucide-react";
import MobileHeader from "@/components/MobileHeader";

const items = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/today", label: "امروز", icon: CalendarCheck },
  { href: "/tasks", label: "وظایف", icon: ListTodo },
  { href: "/habits", label: "عادت‌ها", icon: Repeat },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <MobileHeader
        externalOpen={moreOpen}
        onExternalOpenChange={setMoreOpen}
      />

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-around h-16">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-xs w-full h-full ${
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs w-full h-full text-gray-400 dark:text-gray-600"
          >
            <Menu size={22} />
            <span>بیشتر</span>
          </button>
        </div>
      </nav>
    </>
  );
}
