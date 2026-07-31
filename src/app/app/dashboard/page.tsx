import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  TrendingUp,
  TrendingDown,
  Plus,
  Target,
  Activity,
  ChevronLeft,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDashboardAnalytics } from "@/actions/dashboard";

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

  const netBalance = analytics.incomeTotal - analytics.expenseTotal;

  return (
    <div className="min-h-screen bg-white text-darkGray p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">داشبورد</h1>
            <p className="text-sm text-darkGray/70 mt-1">
              {user.name ? `خوش آمدی ${user.name}` : "خوش آمدی"}
            </p>
          </div>
          <Link
            href="/app/today"
            className="inline-flex items-center gap-2 rounded-xl border border-gray px-4 py-2 text-sm font-medium hover:bg-gray/30"
          >
            <ChevronLeft className="h-4 w-4" />
            امروز
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-gray p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-darkGray/70">
              <CheckCircle2 className="h-4 w-4 text-green" />
              کارهای انجام‌شده
            </div>
            <div className="mt-3 text-3xl font-bold">
              {formatNumber(analytics.completedTasksCount)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-darkGray/70">
              <Flame className="h-4 w-4 text-lightGreen" />
              عادت‌های ثبت‌شده
            </div>
            <div className="mt-3 text-3xl font-bold">
              {formatNumber(analytics.completedHabitsCount)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-darkGray/70">
              <TrendingUp className="h-4 w-4 text-green" />
              درآمد
            </div>
            <div className="mt-3 text-3xl font-bold">
              {formatNumber(analytics.incomeTotal)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-darkGray/70">
              <TrendingDown className="h-4 w-4 text-darkGreen" />
              هزینه
            </div>
            <div className="mt-3 text-3xl font-bold">
              {formatNumber(analytics.expenseTotal)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green" />
              <h2 className="text-lg font-bold">اهداف</h2>
            </div>

            <div className="space-y-4">
              {analytics.goalsProgress.length > 0 ? (
                analytics.goalsProgress.map((goal) => (
                  <div key={goal.id} className="rounded-xl border border-gray p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-darkGray/70">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray">
                      <div
                        className="h-2 rounded-full bg-green"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-darkGray/60">هدفی ثبت نشده است.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green" />
              <h2 className="text-lg font-bold">عادت‌ها</h2>
            </div>

            <div className="space-y-4">
              {analytics.habitSummaries.length > 0 ? (
                analytics.habitSummaries.map((habit) => (
                  <div key={habit.id} className="rounded-xl border border-gray p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{habit.title}</span>
                      <span className="text-sm text-darkGray/70">
                        {formatNumber(habit.points)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-darkGray/60">عادت فعالی ثبت نشده است.</p>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-gray p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-green" />
            <h2 className="text-lg font-bold">خلاصه مالی</h2>
          </div>

          <div className="text-sm text-darkGray/70">
            مانده: {formatNumber(netBalance)}
          </div>
        </section>
      </div>
    </div>
  );
}
