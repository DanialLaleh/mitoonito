"use client";

import { logoutAction } from "@/actions/auth";
import { toPersianDigits } from "@/lib/format";
import { User, Mail, Crown, LogOut } from "lucide-react";

type Usage = {
  areasCount: number;
  goalsCount: number;
  habitsCount: number;
};

export default function SettingsView({
  name,
  email,
  plan,
  usage,
}: {
  name: string;
  email: string;
  plan: "FREE" | "PREMIUM";
  usage: Usage;
}) {
  const isFree = plan === "FREE";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        تنظیمات
      </h1>

      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <User size={16} className="text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">نام</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">ایمیل</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Crown
              size={16}
              className={
                isFree ? "text-gray-400 dark:text-gray-500" : "text-yellow-500"
              }
            />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                پلن فعلی
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isFree ? "رایگان" : "ویژه"}
              </p>
            </div>
          </div>
        </div>

        {isFree && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
              وضعیت مصرف پلن رایگان
            </p>
            <UsageBar label="حوزه‌ها" current={usage.areasCount} max={5} />
            <UsageBar label="اهداف فعال" current={usage.goalsCount} max={10} />
            <UsageBar
              label="عادت‌های فعال"
              current={usage.habitsCount}
              max={10}
            />

            <div className="mt-4 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-xl p-3 text-center">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">
                ارتقا به پلن ویژه
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                به‌زودی در دسترس خواهد بود
              </p>
            </div>
          </div>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-sm font-medium rounded-xl py-3"
          >
            <LogOut size={16} />
            خروج از حساب
          </button>
        </form>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number;
}) {
  const percent = Math.min(100, Math.round((current / max) * 100));
  const isNearLimit = current >= max;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span
          className={
            isNearLimit
              ? "text-red-600 dark:text-red-400 font-medium"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {toPersianDigits(current)} / {toPersianDigits(max)}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${
            isNearLimit ? "bg-red-500" : "bg-green-600"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
