"use client";

import { toPersianDigits } from "@/lib/format";

type Transaction = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
};

function toShortToman(n: number) {
  if (n >= 1_000_000) return toPersianDigits((n / 1_000_000).toFixed(1)) + "م";
  if (n >= 1_000) return toPersianDigits(Math.round(n / 1_000)) + "ه";
  return toPersianDigits(n);
}

export default function FinanceTrendChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const now = new Date();
  const months: { label: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTx = transactions.filter((t) => {
      const td = new Date(t.date);
      return (
        td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
      );
    });
    const income = monthTx
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0);
    const label = d.toLocaleDateString("fa-IR", { month: "short" });
    months.push({ label, income, expense });
  }

  const maxValue = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));

  const hasAnyData = months.some((m) => m.income > 0 || m.expense > 0);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          روند ۶ ماه اخیر
        </p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            درآمد
          </span>
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            هزینه
          </span>
        </div>
      </div>

      {!hasAnyData ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">
          هنوز داده‌ی کافی برای نمایش روند نداری.
        </p>
      ) : (
        <div className="flex items-end justify-between gap-2 h-36">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-1 h-28">
                <div
                  className="w-2.5 rounded-t bg-green-500"
                  style={{ height: `${(m.income / maxValue) * 100}%` }}
                  title={toShortToman(m.income)}
                />
                <div
                  className="w-2.5 rounded-t bg-red-400"
                  style={{ height: `${(m.expense / maxValue) * 100}%` }}
                  title={toShortToman(m.expense)}
                />
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
