import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDashboardAnalytics } from "@/app/actions/dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num);
}

function Icon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const analytics = await getDashboardAnalytics(user.id);

  const {
    completedTasksCount,
    completedHabitsCount,
    incomeTotal,
    expenseTotal,
    hourlyActivity,
    goalsProgress,
    habitSummaries,
  } = analytics;

  const totalActivity = completedTasksCount + completedHabitsCount;
  const netBalance = incomeTotal - expenseTotal;
  const maxActivity = Math.max(...Object.values(hourlyActivity), 1);

  return (
    <div className="min-h-screen bg-brand-gray/20 pb-24 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-darkGray md:text-3xl">
              داشبورد عملکرد
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              تصویری از پیشرفت و فعالیت‌های شما در این هفته
            </p>
          </div>
          <Link
            href="/app/today"
            className="flex items-center justify-center gap-2 rounded-xl bg-brandGreen px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brandGreen/20 transition-all hover:bg-darkGreen"
          >
            <span aria-hidden="true">+</span>
            <span>ثبت فعالیت جدید</span>
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <Icon className="bg-lightGreen/20 text-brandGreen">✓</Icon>
              <span className="text-xs font-medium text-green-600">این هفته</span>
            </div>
            <p className="text-2xl font-bold text-darkGray">
              {formatNumber(completedTasksCount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">وظیفه انجام شده</p>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <Icon className="bg-orange-100 text-orange-600">⚡</Icon>
              <span className="text-xs font-medium text-orange-600">مستمر</span>
            </div>
            <p className="text-2xl font-bold text-darkGray">
              {formatNumber(completedHabitsCount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">عادت انجام شده</p>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <Icon className="bg-blue-100 text-blue-600">↑</Icon>
              <span className="text-xs font-medium text-blue-600">مالی</span>
            </div>
            <p className="text-2xl font-bold text-darkGray">
              {formatNumber(incomeTotal)}
            </p>
            <p className="mt-1 text-xs text-gray-500">مجموع درآمد</p>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <Icon className="bg-red-100 text-red-600">↓</Icon>
              <span className="text-xs font-medium text-red-600">هزینه</span>
            </div>
            <p className="text-2xl font-bold text-darkGray">
              {formatNumber(expenseTotal)}
            </p>
            <p className="mt-1 text-xs text-gray-500">مجموع هزینه‌ها</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-darkGray">نمودار فعالیت ساعتی</h2>
                <p className="mt-1 text-xs text-gray-500">
                  بیشترین فعالیت شما در چه ساعتی است؟
                </p>
              </div>
            </div>

            <div className="flex h-64 items-end justify-between gap-2 pt-8">
              {Array.from({ length: 24 }).map((_, hour) => {
                const count = hourlyActivity[hour] || 0;
                const height = count > 0 ? (count / maxActivity) * 100 : 4;

                return (
                  <div
                    key={hour}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="relative w-full rounded-t-md bg-brandGreen/80 transition-all hover:bg-brandGreen"
                      style={{ height: `${height}%` }}
                    >
                      {count > 0 && (
                        <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-xs font-bold text-darkGray group-hover:block">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-bold text-darkGray">خلاصه مالی</h2>
            <div className="mb-6 rounded-xl bg-brand-gray/30 p-4">
              <p className="mb-1 text-xs text-gray-500">موجودی خالص</p>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-brandGreen" : "text-red-500"
                }`}
              >
                {formatNumber(netBalance)}{" "}
                <span className="text-sm font-normal">تومان</span>
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">درآمد</span>
                <span className="font-bold text-green-600">
                  +{formatNumber(incomeTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">هزینه</span>
                <span className="font-bold text-red-500">
                  -{formatNumber(expenseTotal)}
                </span>
              </div>
            </div>

            <Link
              href="/app/finances"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-brandGreen hover:underline"
            >
              مشاهده جزئیات مالی
              <span aria-hidden="true">‹</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-darkGray">پیشرفت اهداف</h2>
              <Link
                href="/app/goals"
                className="text-xs font-medium text-brandGreen hover:underline"
              >
                مشاهده همه
              </Link>
            </div>

            <div className="space-y-6">
              {goalsProgress.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  هنوز هدفی ثبت نکرده‌اید.
                </div>
              ) : (
                goalsProgress.map((goal) => (
                  <div key={goal.id}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-darkGray">
                        {goal.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {goal.completedTasks} از {goal.totalTasks} وظیفه
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brandGreen transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-bold text-darkGray">خلاصه عادت‌ها</h2>
            <div className="space-y-4">
              {habitSummaries.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  هنوز عادتی ثبت نکرده‌اید.
                </div>
              ) : (
                habitSummaries.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-darkGray">
                        {habit.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {habit.totalLogs} بار انجام شده
                      </p>
                    </div>
                    <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
                      {habit.points} امتیاز
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-gray bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-darkGray">جمع‌بندی</h2>
          <p className="text-sm text-gray-600">
            مجموع فعالیت ثبت‌شده:{" "}
            <span className="font-bold text-darkGray">
              {formatNumber(totalActivity)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
