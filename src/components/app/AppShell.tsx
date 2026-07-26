import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { href: "/app/today", label: "امروز" },
  { href: "/app/areas", label: "حوزه‌ها" },
  { href: "/app/goals", label: "اهداف" },
  { href: "/app/habits", label: "عادت‌ها" },
  { href: "/app/dashboard", label: "داشبورد" },
  { href: "/app/settings", label: "تنظیمات" },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <header className="sticky top-0 z-20 border-b border-brand-gray bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Logo className="h-7 w-auto" />
          <h1 className="text-sm font-semibold md:text-base">{title}</h1>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-brand-charcoal/80 hover:bg-brand-soft/30 hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
