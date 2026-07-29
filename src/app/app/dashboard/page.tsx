import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDashboardAnalytics } from "@/app/actions/dashboard";

export const dynamic = "force-dynamic";

function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#434345]">داشبورد</h1>
        <p className="text-sm text-gray-500 mt-1">
          نمای کلی عملکرد، اهداف، عادت‌ها و تراکنش‌ها
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">تسک‌های تکمیل‌شده</p>
          <p className="text-2xl font-bold text-[#434345] mt-2">
            {formatNumber(analytics.completedTasksCount)}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">عادت‌های ثبت‌شده</p>
          <p className="text-2xl font-bold text-[#434345] mt-2">
            {formatNumber(analytics.completedHabitsCount)}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">درآمد</p>
          <p className="text-2xl font-bold text-[#434345] mt-2">
            {formatNumber(Math.round(analytics.incomeTotal))}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">هزینه</p>
          <p className="text-2xl font-bold text-[#434345] mt-2">
            {formatNumber(Math.round(analytics.expenseTotal))}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#434345]">ساعات طلایی فعالیت</h2>
        {hourlyEntries.length === 0 ? (
          <p className="text-sm text-gray-500">داده‌ای برای تحلیل ساعت‌ها وجود ندارد.</p>
        ) : (
          <div className="space-y-3">
            {hourlyEntries.map((entry) => (
              <div key={entry.hour} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-500">
                  {String(entry.hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#50B848] rounded-full"
                    style={{ width: `${Math.min(entry.count * 20, 100)}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-[#434345] text-right">{entry.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#434345]">پیشرفت اهداف</h2>
        {analytics.goalsProgress.length === 0 ? (
          <p className="text-sm text-gray-500">هنوز هدف فعالی وجود ندارد.</p>
        ) : (
          <div className="space-y-4">
            {analytics.goalsProgress.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#434345]">{goal.title}</span>
                  <span className="text-gray-500">{goal.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#50B848]"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-[#434345]">تسک‌های اخیر</h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500">تسکی وجود ندارد.</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#434345]">{task.title}</p>
                    {task.dueDate ? (
                      <p className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString("fa-IR")}
                      </p>
                    ) : null}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${task.isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {task.isCompleted ? "انجام شده" : "در انتظار"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-[#434345]">عادت‌های اخیر</h2>
          {recentHabits.length === 0 ? (
            <p className="text-sm text-gray-500">عادت ثبت نشده است.</p>
          ) : (
            <ul className="space-y-3">
              {recentHabits.map((habit) => (
                <li key={habit.id} className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-medium text-[#434345]">{habit.title}</p>
                  <p className="text-xs text-gray-500 mt-1">امتیاز: {formatNumber(habit.points)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
