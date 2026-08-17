"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { logoutAction } from "@/actions/auth";
import {
  Menu,
  X,
  Target,
  Layers,
  Wallet,
  Bell,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

const moreItems = [
  { href: "/goals", label: "اهداف", icon: Target },
  { href: "/areas", label: "حوزه‌ها", icon: Layers },
  { href: "/finances", label: "مالی", icon: Wallet },
  { href: "/reminders", label: "یادآورها", icon: Bell },
  { href: "/settings", label: "تنظیمات", icon: Settings },
];

export default function MobileHeader({
  externalOpen,
  onExternalOpenChange,
}: {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onExternalOpenChange ?? setInternalOpen;
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4">
        <img
          src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
          alt="میتونی‌تو"
          className="h-8 w-auto"
        />
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-2xl p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">بیشتر</p>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {moreItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      isActive
                        ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 font-medium"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                {theme === "light" ? "حالت تیره" : "حالت روشن"}
              </button>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 w-full"
                >
                  خروج از حساب
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
