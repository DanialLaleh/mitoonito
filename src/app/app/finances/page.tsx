import { getFinanceSummary } from "@/app/actions/finance";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FinancePage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const { transactions, balance, totalIncome, totalExpense } = await getFinanceSummary(session.userId as string);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#434345]">امور مالی</h1>
        <Link href="/app/finance/new" className="bg-[#50B848] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">
          ثبت تراکنش جدید
        </Link>
      </div>

      {/* کارت موجودی کل */}
      <div className="bg-[#434345] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs opacity-60 font-bold uppercase tracking-widest">موجودی فعلی</span>
          <div className="text-3xl font-black mt-2 tracking-tight">
            {balance.toLocaleString()} <span className="text-sm font-normal opacity-60 text-[#9FD18B]">تومان</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* خلاصه درآمد و هزینه */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-[#E6E7E8] flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 mb-1">کل درآمد</span>
          <span className="text-lg font-black text-[#50B848]">+{totalIncome.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-[#E6E7E8] flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 mb-1">کل هزینه</span>
          <span className="text-lg font-black text-red-500">-{totalExpense.toLocaleString()}</span>
        </div>
      </div>

      {/* لیست تراکنش‌های اخیر */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#434345] mr-2">تراکنش‌های اخیر</h2>
        <div className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-[#E6E7E8] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {t.type === 'INCOME' ? '📥' : '📤'}
                  </div>
                  <div>
                    <div className="font-bold text-[#434345] text-sm">{t.category}</div>
                    <div className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString('fa-IR')}</div>
                  </div>
                </div>
                <div className={`font-black ${t.type === 'INCOME' ? 'text-[#50B848]' : 'text-red-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm italic">
              هنوز هیچ تراکنشی ثبت نکردی. خرج کن تا تحلیلش کنیم!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
