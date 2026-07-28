import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/app/AppShell";
import { createTransactionAction, deleteTransactionAction } from "./actions";

export default async function FinancesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  // محاسبه خلاصه وضعیت مالی
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">امور مالی</h1>
          <p className="text-sm text-dark-gray/70">مدیریت درآمدها و هزینه‌های شما</p>
        </div>

        {/* کارت‌های خلاصه وضعیت */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-dark-gray/60">موجودی کل</p>
            <p className={`mt-1 text-xl font-bold ${balance >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
              {balance.toLocaleString("fa-IR")} <span className="text-xs font-normal">تومان</span>
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-dark-gray/60">مجموع درآمدها</p>
            <p className="mt-1 text-xl font-bold text-brand-green">
              {totalIncome.toLocaleString("fa-IR")} <span className="text-xs font-normal text-dark-gray">تومان</span>
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-dark-gray/60">مجموع هزینه‌ها</p>
            <p className="mt-1 text-xl font-bold text-red-500">
              {totalExpense.toLocaleString("fa-IR")} <span className="text-xs font-normal text-dark-gray">تومان</span>
            </p>
          </div>
        </div>

        {/* فرم ثبت تراکنش جدید */}
        <form
          action={createTransactionAction}
          className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-4"
        >
          <input
            name="amount"
            type="number"
            placeholder="مبلغ (تومان)..."
            required
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />
          <select
            name="type"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          >
            <option value="EXPENSE">هزینه</option>
            <option value="INCOME">درآمد</option>
          </select>
          <input
            name="category"
            placeholder="دسته‌بندی (مثلاً: غذا، حقوق)"
            required
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-green px-4 py-3 font-medium text-white transition hover:bg-brand-darkGreen"
          >
            ثبت تراکنش
          </button>
        </form>

        {/* لیست تراکنش‌های اخیر */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-gray">تراکنش‌های اخیر</h2>
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-dark-gray/60">
              هنوز هیچ تراکنشی ثبت نکرده‌ای.
            </div>
          ) : (
            <div className="grid gap-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                        t.type === "INCOME" ? "bg-brand-green/10 text-brand-green" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-gray">{t.category}</p>
                      <p className="text-[10px] text-dark-gray/50">
                        {new Date(t.date).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === "INCOME" ? "text-brand-green" : "text-red-500"}`}>
                      {t.amount.toLocaleString("fa-IR")}
                    </span>
                    <form action={deleteTransactionAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-gray-400 hover:text-red-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
