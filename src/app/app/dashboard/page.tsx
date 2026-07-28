import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

// تابع کمکی برای فرمت‌دهی به اعداد مالی و امتیاز
function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num);
}

// محاسبه سطح کاربر بر اساس امتیاز
function getLevelInfo(score: number) {
  if (score < 500) return { name: "نوپا 🛡️", color: "text-blue-500", bg: "bg-blue-50" };
  if (score < 2000) return { name: "پویا ⚡", color: "text-[#50B848]", bg: "bg-[#50B848]/10" };
  if (score < 5000) return { name: "پیشرو 🔥", color: "text-orange-500", bg: "bg-orange-50" };
  return { name: "استاد بهره‌وری 🏆", color: "text-purple-600", bg: "bg-purple-50" };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // ۱. دریافت آمار تسک‌ها، اهداف و عادت‌ها
  const [totalTasks, completedTasks, totalGoals, completedGoals, totalHabits, habitLogs] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, isCompleted: true } }),
    prisma.habit.count({ where: { userId: user.id } }),
    prisma.habitLog.findMany({ where: { habit: { userId: user.id } }, select: { loggedAt: true } }),
  ]);

  // ۲. محاسبه امتیاز رشد (گیمیفیکیشن)
  const totalGrowthScore = (completedTasks * 10) + (completedGoals * 100) + (habitLogs.length * 15);
  const level = getLevelInfo(totalGrowthScore);

  // ۳. تحلیل ساعت طلایی (Golden Hour)
  const completedTasksWithTime = await prisma.task.findMany({
    where: { userId: user.id, isCompleted: true, completedAt: { not: null } },
    select: { completedAt: true },
  });

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

  // ۴. آمار مالی
  const [incomeRes, expenseRes, transactions] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId: user.id, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId: user.id, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 4 }),
  ]);

  const totalIncome = incomeRes._sum.amount || 0;
  const totalExpense = expenseRes._sum.amount || 0;
  const balance = totalIncome - totalExpense;

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-28 text-right" dir="rtl">
      {/* هدر و سطح کاربر */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#434345]">سلام دانیال 👋</h1>
          <p className="text-xs text-gray-500 mt-1">بیا امروز هم قدمی برای اهدافت برداری.</p>
        </div>
        <div className={`${level.bg} ${level.color} px-4 py-2 rounded-2xl border border-current/20 text-center`}>
          <span className="block text-[10px] font-bold opacity-70">سطح فعلی</span>
          <span className="text-sm font-black">{level.name}</span>
        </div>
      </div>

      {/* امتیاز کلی رشد (Hero Card) */}
      <div className="bg-[#434345] text-white rounded-[2rem] p-6 mb-8 shadow-xl shadow-gray-200 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-medium opacity-70">امتیاز کل رشد شما</span>
          <div className="text-4xl font-black mt-1 mb-4">{formatNumber(totalGrowthScore)}</div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#9FD18B]" 
              style={{ width: `${Math.min((totalGrowthScore % 500) / 5, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] mt-2 opacity-60 text-left">تا سطح بعدی: {formatNumber(500 - (totalGrowthScore % 500))} امتیاز</p>
        </div>
        {/* المان تزیینی پشت‌زمینه */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#50B848] opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* ساعت طلایی */}
      <div className="bg-gradient-to-l from-[#9FD18B]/20 to-transparent border-r-4 border-[#50B848] p-4 mb-8 rounded-l-2xl">
        <h3 className="text-xs font-black text-[#367639] mb-1">💡 تحلیل ساعت طلایی</h3>
        {goldenHour !== null ? (
          <p className="text-[11px] text-gray-600 leading-5">
            دانیال، دیتای تو نشان می‌دهد بازه ساعت <span className="font-bold text-[#367639]">{goldenHour}:۰۰</span> زمان اوج عملکرد توست. کارهای استراتژیک مارکتینگ را برای این ساعت رزرو کن!
          </p>
        ) : (
          <p className="text-[11px] text-gray-500">با ثبت اولین فعالیت‌ها، ساعت طلایی تو اینجا ظاهر می‌شود.</p>
        )}
      </div>

      {/* ویجت‌های سریع */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-[#E6E7E8] p-4 rounded-3xl">
          <span className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">FINANCE</span>
          <span className={`text-sm font-black ${balance >= 0 ? 'text-[#367639]' : 'text-red-500'}`}>
            {formatNumber(balance)} <small className="text-[10px] font-normal">تومان</small>
          </span>
        </div>
        <div className="bg-white border border-[#E6E7E8] p-4 rounded-3xl">
          <span className="text-[10px] font-bold text-gray-400 block mb-1">TASKS</span>
          <span className="text-sm font-black text-[#434345]">
            {completedTasks} <small className="text-gray-400 font-normal">از {totalTasks}</small>
          </span>
        </div>
      </div>

      {/* تراکنش‌های اخیر */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black text-[#434345]">آخرین تراکنش‌ها</h3>
          <a href="/app/finance" className="text-[10px] font-bold text-[#50B848]">مشاهده همه ←</a>
        </div>
        {transactions.map((t) => (
          <div key={t.id} className="bg-white border border-[#E6E7E8] p-3 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${t.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {t.type === 'INCOME' ? '📥' : '📤'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#434345]">{t.category}</p>
                <p className="text-[9px] text-gray-400">{t.description || 'بدون توضیح'}</p>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold ${t.type === 'INCOME' ? 'text-[#50B848]' : 'text-red-500'}`}>
              {t.type === 'INCOME' ? '+' : '-'}{formatNumber(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
