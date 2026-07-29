import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDashboardAnalytics } from "@/actions/dashboard";
import Link from "next/link";
import { 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Target, 
  Activity,
  ChevronLeft
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const analytics = await getDashboardAnalytics(user.id);

  const hourlyEntries = Object.entries(analytics.hourlyActivity)
    .map(([hour, count]) => ({
      hour: Number(hour),
      count,
    }))
    .sort((a, b) => a.hour - b.hour);

  const recentTasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentHabits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // محاسبه تراز مالی
  const balance = analytics.incomeTotal - analytics.expenseTotal;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-24 md:pb-6">
      {/* هدر داشبورد و خوش‌آمدگویی */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#434345]">سلام دانیال عزیز 👋</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            بیایید امروز هم اهداف و عادت‌هایمان را به زانو درآوریم!
          </p>
        </div>

        {/* دکمه‌های دسترسی سریع (Quick Actions) مخصوص موبایل */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/app/today"
            className="flex items-center gap-1 bg-[#50B848] text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#367639] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            تسک جدید
          </Link>
          <Link
            href="/app/habits/new"
            className="flex items-center gap-1 bg-[#434345] text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            عادت جدید
          </Link>
          <Link
            href="/app/finances"
            className="flex items-center gap-1 bg-white border border-[#E6E7E8] text-[#434345] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            ثبت تراکنش
          </Link>
        </div>
      </div>

      {/* کارت‌های شاخص عملکرد (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* تسک‌های انجام شده */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-500 font-medium">کارهای انجام‌شده</span>
            <span className="p-1.5 rounded-lg bg-green-50 text-[#50B848]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-[#434345] mt-2">
              {formatNumber(analytics.completedTasksCount)}
            </p>
          </div>
        </div>

        {/* عادت‌های ثبت شده */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-500 font-medium font-medium">عادت‌های ثبت‌شده</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-[#434345] mt-2">
              {formatNumber(analytics.completedHabitsCount)}
            </p>
          </div>
        </div>

        {/* وضعیت تراز مالی */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-500 font-medium">تراز مالی (تومان)</span>
            <span className={`p-1.5 rounded-lg ${balance >= 0 ? "bg-green-50 text-[#50B848]" : "bg-red-50 text-red-500"}`}>
              {balance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </span>
          </div>
          <div>
            <p className={`text-lg md:text-xl font-bold mt-2 ${balance >= 0 ? "text-[#434345]" : "text-red-500"}`}>
              {formatNumber(Math.round(balance))}
            </p>
          </div>
        </div>

        {/* مجموع هزینه‌ها */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-gray-500 font-medium">کل هزینه‌ها</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-500">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-[#434345] mt-2">
              {formatNumber(Math.round(analytics.expenseTotal))}
            </p>
          </div>
        </div>
      </div>

      {/* ساعت طلایی فعالیت */}
      <div className="rounded-2xl bg-white border border-[#E6E7E8] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#50B848]" />
            <h2 className="text-lg font-semibold text-[#434345]">ساعات طلایی فعالیت</h2>
          </div>
          <span className="text-xs text-gray-400">بر اساس زمان ثبت اقدامات واقعی</span>
        </div>

        {hourlyEntries.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">داده‌ای برای تحلیل ساعت‌های طلایی شما در این هفته ثبت نشده است.</p>
        ) : (
          <div className="space-y-3">
            {hourlyEntries.map((entry) => (
              <div key={entry.hour} className="flex items-center gap-3">
                <div className="w-12 text-xs md:text-sm text-gray-500 text-left font-mono">
                  {String(entry.hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 h-3 bg-[#E6E7E8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#50B848] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(entry.count * 20, 100)}%` }}
                  />
                </div>
                <div className="w-8 text-xs md:text-sm font-semibold text-[#434345] text-right font-mono">
                  {formatNumber(entry.count)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* پیشرفت اهداف */}
      <div className="rounded-2xl bg-white border border-[#E6E7E8] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#50B848]" />
          <h2 className="text-lg font-semibold text-[#434345]">پیشرفت اهداف فعال</h2>
        </div>

        {analytics.goalsProgress.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">هنوز هدف فعالی را شروع نکرده‌اید. همین حالا اولین را بسازید!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {analytics.goalsProgress.map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl border border-[#E6E7E8] bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#434345] truncate max-w-[200px]">{goal.title}</span>
                  <span className="text-[#50B848] font-bold font-mono">{formatNumber(goal.progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E6E7E8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#50B848] transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>کارهای کامل شده:</span>
                  <span className="font-mono">{formatNumber(goal.completedTasks)} از {formatNumber(goal.totalTasks)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* تسک‌ها و عادت‌های اخیر */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* تسک‌های اخیر */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#434345]">کارهای اخیر</h2>
            <Link href="/app/today" className="text-xs text-[#50B848] flex items-center hover:underline">
              مشاهده همه
              <ChevronLeft className="w-3 h-3 mr-0.5" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">کار ثبت شده‌ای یافت نشد.</p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-xl bg-gray-50/50 border border-[#E6E7E8]/50 px-4 py-3">
                  <div className="min-w-0 flex-1 pl-2">
                    <p className="text-sm font-medium text-[#434345] truncate">{task.title}</p>
                    {task.dueDate ? (
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        مهلت: {new Date(task.dueDate).toLocaleDateString("fa-IR")}
                      </p>
                    ) : null}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${task.isCompleted ? "bg-green-50 text-[#50B848]" : "bg-yellow-50 text-yellow-600"}`}>
                    {task.isCompleted ? "انجام شده" : "در انتظار"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* عادت‌های اخیر */}
        <div className="rounded-2xl bg-white border border-[#E6E7E8] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#434345]">عادت‌های اخیر</h2>
            <Link href="/app/habits" className="text-xs text-[#50B848] flex items-center hover:underline">
              مشاهده همه
              <ChevronLeft className="w-3 h-3 mr-0.5" />
            </Link>
          </div>

          {recentHabits.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">هنوز هیچ عادتی تعریف نکرده‌اید.</p>
          ) : (
            <ul className="space-y-2">
              {recentHabits.map((habit) => (
                <li key={habit.id} className="flex items-center justify-between rounded-xl bg-gray-50/50 border border-[#E6E7E8]/50 px-4 py-3">
                  <span className="text-sm font-medium text-[#434345] truncate">{habit.title}</span>
                  <span className="text-xs bg-[#9FD18B]/20 text-[#367639] px-2.5 py-1 rounded-xl font-bold font-mono">
                    امتیاز: {formatNumber(habit.points)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
