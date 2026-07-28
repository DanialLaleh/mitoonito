import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/app/AppShell";
import { planLimits } from "@/lib/design-tokens";
import { createHabitAction, toggleHabitLogAction, deleteHabitAction } from "./actions";

export default async function HabitsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [habits, habitCount] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.habit.count({
      where: { userId: user.id },
    }),
  ]);

  const limit = planLimits[user.plan as keyof typeof planLimits]?.maxHabits ?? 0;

  // مشخص کردن تاریخ امروز بدون زمان برای بررسی وضعیت انجام کار
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">عادت‌های من</h1>
          <p className="text-sm text-dark-gray/70">
            {habitCount} از {limit} عادت فعال تعریف شده است
          </p>
        </div>

        {/* فرم ثبت عادت جدید */}
        <form
          action={createHabitAction}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <input
            name="title"
            placeholder="چه عادتی رو می‌خوای بسازی؟ (مثلاً: ۳۰ دقیقه کتابخوانی)"
            required
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />

          <select
            name="frequency"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          >
            <option value="DAILY">روزانه</option>
            <option value="WEEKLY">هفتگی</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-brand-green px-6 py-3 font-medium text-white transition hover:bg-brand-darkGreen"
          >
            ثبت عادت
          </button>
        </form>

        {/* لیست عادت‌ها */}
        {habits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-dark-gray/60">
            هنوز عادتی ثبت نکرده‌ای. عادت‌های کوچک روزانه، نتایج بزرگ می‌سازند!
          </div>
        ) : (
          <div className="grid gap-3">
            {habits.map((habit) => {
              // بررسی اینکه آیا این عادت امروز انجام شده است یا خیر
              const isDoneToday = habit.logs.some(
                (log) => new Date(log.date).getTime() === today.getTime()
              );

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {/* دکمه وضعیت انجام امروز */}
                    <form action={toggleHabitLogAction}>
                      <input type="hidden" name="habitId" value={habit.id} />
                      <button
                        type="submit"
                        className={`h-10 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                          isDoneToday
                            ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                            : "bg-gray-50 text-dark-gray hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        {isDoneToday ? "✓ انجام شد" : "انجام امروز؟"}
                      </button>
                    </form>

                    <div>
                      <h3 className="font-semibold text-dark-gray">{habit.title}</h3>
                      <p className="text-[10px] text-dark-gray/50 mt-0.5">
                        بازه زمانی: {habit.frequency === "DAILY" ? "روزانه" : "هفتگی"} | دفعات ثبت شده: {habit.logs.length} بار
                      </p>
                    </div>
                  </div>

                  {/* دکمه حذف عادت */}
                  <form action={deleteHabitAction}>
                    <input type="hidden" name="habitId" value={habit.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
