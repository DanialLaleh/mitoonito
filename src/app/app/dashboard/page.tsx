import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import Link from "next/link";
import { 
  TrendingUp, 
  CheckCircle2, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Zap, 
  Trophy 
} from "lucide-react";

// غیرفعال کردن کش برای بارگذاری دقیق داده‌های لحظه‌ای دیتابیس
export const dynamic = "force-dynamic";

// تابع کمکی برای فرمت‌دهی به اعداد
function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num);
}

// محاسبه سطح کاربر بر اساس امتیاز - منطق گیمیفیکیشن میتونی‌تو
function getLevelInfo(score: number) {
  if (score < 500) return { name: "نوپا 🛡️", color: "text-blue-600", bg: "bg-blue-50", next: 500 };
  if (score < 2000) return { name: "پویا ⚡", color: "text-[#50B848]", bg: "bg-[#50B848]/10", next: 2000 };
  if (score < 5000) return { name: "پیشرو 🔥", color: "text-orange-600", bg: "bg-orange-50", next: 5000 };
  return { name: "استاد بهره‌وری 🏆", color: "text-purple-600", bg: "bg-purple-50", next: 10000 };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // ۱. دریافت جامع آمار در یک درخواست (Performance Optimizing)
  const [
    totalTasks, 
    completedTasks, 
    totalGoals, 
    completedGoals, 
    habitLogsCount,
    incomeRes,
    expenseRes,
    recentTransactions,
    completedTasksWithTime
  ] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.habitLog.count({ where: { habit: { userId: user.id } } }),
    prisma.transaction.aggregate({ where: { userId: user.id, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId: user.id, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 4 }),
    prisma.task.findMany({
      where: { userId: user.id, isCompleted: true, completedAt: { not: null } },
      select: { completedAt: true },
    })
  ]);

  // ۲. گیمیفیکیشن و سطح‌بندی
  const totalGrowthScore = (completedTasks * 10) + (completedGoals * 100) + (habitLogsCount * 15);
  const level = getLevelInfo(totalGrowthScore);
  const progressToNextLevel = Math.min((totalGrowthScore / level.next) * 100, 100);

  // ۳. تحلیل ساعت طلایی و توزیع فعالیت
  const hourCounts: Record<number, number> = {};
  completedTasksWithTime.forEach((t) => {
    if (t.completedAt) {
      const hour = new Date(t.completedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const goldenHour = Object.entries(hourCounts).length > 0 
    ? parseInt(Object.entries(hourCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]) 
    : null;

  // ۴. محاسبات مالی
  const totalIncome = incomeRes._sum.amount || 0;
  const totalExpense = expenseRes._sum.amount || 0;
  const balance = totalIncome - totalExpense;

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-32 text-right" dir="rtl">
      {/* پروفایل و وضعیت سطح */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#434345]">سلام دانیال 👋</h1>
          <p className="text-xs text-gray-500 mt-1">امروز برای مارکتینگ میتونی‌تو چه ایده‌ای داری؟</p>
        </div>
        <div className={`${level.bg} ${level.color} px-4 py-2 rounded-2xl border border-current/10 flex flex-col items-center shadow-sm`}>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Level</span>
          <span className="text-sm font-black">{level.name}</span>
        </div>
      </div>

      {/* کارت امتیاز مرکزی (Growth Hero) */}
      <div className="bg-[#434345] text-white rounded-[2.5rem] p-7 mb-8 shadow-xl shadow-gray-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-xs font-medium opacity-60">امتیاز کل رشد</span>
              <div className="text-5xl font-black mt-1 leading-none">{formatNumber(totalGrowthScore)}</div>
            </div>
            <div className="text-left text-[10px] font-bold text-[#9FD18B] bg-white/10 px-2 py-1 rounded-lg">
              {formatNumber(Math.max(0, level.next - totalGrowthScore))} امتیاز تا سطح بعد
            </div>
          </div>
          
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-[#50B848] transition-all duration-1000" 
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
        </div>
        {/* المان گرافیکی پس‌زمینه */}
        <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-[#50B848]/20 blur-[60px] rounded-full"></div>
      </div>

      {/* بخش تحلیل ساعت طلایی (Insight) */}
      <div className="bg-white border border-gray-100 p-5 mb-8 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50B848] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#50B848]"></span>
          </span>
          <h3 className="text-xs font-black text-[#434345]">تحلیل ساعت طلایی دانیال</h3>
        </div>
        {goldenHour !== null ? (
          <div className="flex gap-4 items-center">
            <div className="bg-[#50B848]/10 text-[#367639] text-xl p-3 rounded-2xl font-black flex items-center justify-center gap-1 min-w-[70px]">
              <Clock size={16} />
              {goldenHour}:۰۰
            </div>
            <p className="text-[11px] text-gray-600 leading-5">
              بیشترین بازدهی تو در این ساعت ثبت شده. کارهای سنگین فیتنس یا ایده‌پردازی مارکتینگ رو به این ساعت منتقل کن.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">دیتای کافی برای تحلیل وجود ندارد. فعالیت‌های بیشتری ثبت کن!</p>
        )}
      </div>

      {/* ویجت‌های آماری سریع */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/app/finance" className="bg-white border border-gray-100 p-5 rounded-[2rem] active:scale-95 transition-transform shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-1">تراز مالی</span>
            <span className={`text-lg font-black ${balance >= 0 ? 'text-[#367639]' : 'text-red-500'}`}>
              {formatNumber(balance)} <small className="text-[10px] font-normal mr-1">تومان</small>
            </span>
          </div>
          <div className="flex justify-end mt-3 text-gray-400">
            <PiggyBank size={18} />
          </div>
        </Link>
        
        <Link href="/app/tasks" className="bg-white border border-gray-100 p-5 rounded-[2rem] active:scale-95 transition-transform shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 block mb-1">وضعیت تسک‌ها</span>
            <span className="text-lg font-black text-[#434345]">
              {completedTasks} <small className="text-gray-400 font-normal mr-1">از {totalTasks}</small>
            </span>
          </div>
          <div className="flex justify-end mt-3 text-gray-400">
            <CheckCircle2 size={18} />
          </div>
        </Link>
      </div>

      {/* لیست تراکنش‌های اخیر */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-black text-[#434345]">تراکنش‌های اخیر</h3>
          <Link href="/app/finance" className="text-[11px] font-bold text-[#50B848] bg-[#50B848]/10 px-3 py-1 rounded-full hover:bg-[#50B848]/20 transition-colors">
            مدیریت مالی
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    t.type === 'INCOME' ? 'bg-[#50B848]/10 text-[#367639]' : 'bg-red-50 text-red-500'
                  }`}>
                    {t.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#434345]">{t.description || t.category}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{t.category}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-xs font-black ${t.type === 'INCOME' ? 'text-[#367639]' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatNumber(t.amount)}
                  </span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">تومان</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-400">
              هنوز تراکنشی ثبت نکرده‌ای.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
