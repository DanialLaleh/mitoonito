"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { href: "/app/today", label: "امروز" },
  { href: "/app/areas", label: "حوزه‌ها" },
  { href: "/app/goals", label: "اهداف" },
  { href: "/app/habits", label: "عادت‌ها" },
  { href: "/app/dashboard", label: "داشبورد" },
  { href: "/app/settings", label: "تنظیمات" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-soft-cream text-dark-gray">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Logo />
          <nav className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-green text-white shadow-sm"
                      : "text-dark-gray/70 hover:bg-gray-100 hover:text-dark-gray",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
