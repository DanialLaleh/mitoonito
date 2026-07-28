// src/components/layout/BottomNav.tsx
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "داشبورد", href: "/app/dashboard", icon: "📊" },
    { name: "برنامه", href: "/app/today", icon: "✅" },
    { name: "عادت‌ها", href: "/app/habits", icon: "🌿" },
    { name: "مالی", href: "/app/finance", icon: "💰" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E7E8] px-6 py-3 flex justify-between items-center md:hidden z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <span className={`text-xl ${isActive ? "scale-110" : "grayscale opacity-50"} transition-all`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold ${isActive ? "text-[#50B848]" : "text-gray-400"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
