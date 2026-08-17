"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-colors"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      {theme === "light" ? "حالت تیره" : "حالت روشن"}
    </button>
  );
}
