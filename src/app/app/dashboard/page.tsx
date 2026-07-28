import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

// تابع کمکی برای فرمت‌دهی به اعداد مالی
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  // ۱. دریافت اطلاعات آماری پایه‌ای دیتابیس
  const totalTasks = await prisma.task.count({ where: { userId: user.id } });
  const completedTasks = await prisma.task.count({
    where: { userId: user.id, isCompleted: true },
  });

  const totalGoals = await prisma.goal.count({ where: { userId: user.id } });
  const completedGoals = await prisma.goal.count({
    where: { userId: user.id, isCompleted: true },
  });

  const totalHabits = await prisma.habit.count({ where: { userId: user.id } });

  // ۲. دریافت اطلاعات لاگ عادت‌ها برای تحلیل امتیازات و گیمیفیکیشن
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      habit: { userId: user.id },
    },
    select: {
      loggedAt: true,
    },
  });

  // ۳. محاسبه امتیاز رشد (گیمیفیکیشن)
  // فرمول: (تسک‌های تکمیل شده * ۱۰) + (اهداف تکمیل شده * ۱۰۰) + (تعداد کل دفعات تیک زدن عادت‌ها * ۱۵)
  const taskPoints = completedTasks * 10;
  const goalPoints = completedGoals * 100;
  const habitPoints = habitLogs.length * 15;
  const totalGrowthScore = taskPoints + goalPoints + habitPoints;

  // ۴. تحلیل ساعت طلایی (بهره‌وری ۲۴ ساعته)
  // استخراج ساعت‌های ثبت تسک‌های موفق
  const completedTasksWithTime = await prisma.task.findMany({
    where: {
      userId: user.id,
      isCompleted: true,
      completedAt: { not: null },
    },
    select: {
      completedAt: true,
    },
  });

  const hourCounts: { [key: number]: number } = {};
  completedTasksWithTime.forEach((task) => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  let goldenHour = -1;
  let maxCount = 0;
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      goldenHour = parseInt(hour, 10);
    }
  });

  // ۵. پردازش وضعیت تراکنش‌های مالی اخیر
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 5,
  });

  const incomeSum = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "INCOME" },
    _sum: { amount: true },
  });

  const expenseSum = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "EXPENSE" },
    _sum: { amount: true },
  });

  const totalIncome = incomeSum._sum.amount || 0;
  const totalExpense = expenseSum._sum.amount || 0;
  const financialBalance = totalIncome - totalExpense;

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 text-right" dir="rtl">
      {/* هدر داشبورد */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#434345]">داشبورد من</h1>
          <p className="text-xs text-gray-500 mt-1">خلاصه وضعیت رشد و اهداف دانیال</p>
        </div>
        {/* نشان امتیاز کلی رشد */}
        <div className="bg-[#9FD18B]/20 border border-[#9FD18B] px-3.5 py-1.5 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-[#367639] font-bold">امتیاز رشد</span>
          <span className="text-lg font-extrabold text-[#367639]">
            {formatCurrency(totalGrowthScore)}
          </span>
        </div>
      </div>

      {/* بخش کارت‌های آمار سریع */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#E6E7E8] p-3 rounded-2xl text-center">
          <span className="block text-xs text-gray-400 mb-1">تسک‌ها</span>
          <span className="text-base font-bold text-[#434345]">
            {completedTasks} <span className="text-xs text-gray-400">از {totalTasks}</span>
          </span>
        </div>
        <div className="bg-white border border-[#E6E7E8] p-3 rounded-2xl text-center">
          <span className="block text-xs text-gray-400 mb-1">اهداف</span>
          <span className="text-base font-bold text-[#434345]">
            {completedGoals} <span className="text-xs text-gray-400">از {totalGoals}</span>
          </span>
        </div>
        <div className="bg-white border border-[#E6E7E8] p-3 rounded-2xl text-center">
          <span className="block text-xs text-gray-400 mb-1">عادت‌ها</span>
          <span className="text-base font-bold text-[#434345]">{totalHabits}</span>
        </div>
      </div>

      {/* بخش تحلیل ساعت طلایی (Golden Time Slot) */}
      <div className="bg-gradient-to-br from-[#50B848]/10 to-[#9FD18B]/10 border border-[#9FD18B]/30 rounded-2xl p-4 mb-6">
        <h2 className="text-sm font-bold text-[#367639] mb-1">ساعت طلایی بهره‌وری شما</h2>
        {goldenHour !== -1 ? (
          <p className="text-xs text-gray-700 leading-relaxed">
            بیشترین ثبت عملکرد مثبت شما حوالی ساعت <strong className="text-sm text-[#367639]">{goldenHour}:۰۰</strong> ثبت شده است. دانیال، سعی کن کارهای خلاقانه و مهم‌ترین تصمیمات دیجیتال مارکتینگ را در این بازه زمانی برنامه‌ریزی کنی.
          </p>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            اطلاعات ثبت عملکرد شما هنوز کافی نیست. با تیک زدن تسک‌ها در طول روز، نمودار و ساعت بهره‌وری شما در اینجا ترسیم می‌شود.
          </p>
        )}
      </div>

      {/* بخش عملکرد مالی */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#434345] mb-3">تراز مالی میتونی‌تو</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="block text-[10px] text-gray-400">مجموع درآمدها</span>
            <span className="text-sm font-bold text-[#50B848]">{formatCurrency(totalIncome)} تومان</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="block text-[10px] text-gray-400">مجموع هزینه‌ها</span>
            <span className="text-sm font-bold text-red-500">{formatCurrency(totalExpense)} تومان</span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">موجودی خالص:</span>
          <span className={`text-sm font-bold ${financialBalance >= 0 ? 'text-[#367639]' : 'text-red-600'}`}>
            {formatCurrency(financialBalance)} تومان
          </span>
        </div>
      </div>

      {/* تراکنش‌های اخیر مالی */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#434345] mb-3">تراکنش‌های اخیر</h2>
        {transactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">هیچ تراکنش مالی ثبت نشده است.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-[#434345]">{t.description}</p>
                  <span className="text-[9px] text-gray-400">
                    {new Date(t.date).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <span className={`font-bold ${t.type === "INCOME" ? "text-[#50B848]" : "text-red-500"}`}>
                  {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
