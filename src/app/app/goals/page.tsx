import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppShell } from "@/components/app/AppShell";
import { planLimits } from "@/lib/design-tokens";
import { createGoalAction, toggleGoalAction, deleteGoalAction } from "./actions";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [goals, goalCount] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goal.count({
      where: { userId: user.id },
    }),
  ]);

  const limit = planLimits[user.plan as keyof typeof planLimits]?.maxGoals ?? 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">اهداف من</h1>
          <p className="text-sm text-dark-gray/70">
            {goalCount} از {limit} هدف تعریف شده است
          </p>
        </div>

        {/* فرم ثبت هدف جدید */}
        <form
          action={createGoalAction}
          className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2"
        >
          <input
            name="title"
            placeholder="عنوان هدف بزرگ شما..."
            required
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green sm:col-span-2"
          />

          <input
            name="description"
            placeholder="توضیحات کوتاه یا انگیزه انجام این کار..."
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-green"
          />

          <input
            type="date"
            name="targetDate"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none text-right transition focus:border-brand-green"
          />

          <button
            type="submit"
            className="rounded-xl bg-brand-green px-4 py-3 font-medium text-white transition hover:bg-brand-darkGreen sm:col-span-2"
          >
            ثبت هدف جدید
          </button>
        </form>

        {/* لیست اهداف */}
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-dark-gray/60">
            هنوز هدفی برای خودت تعریف نکرده‌ای. چند هدف متمرکز بنویس!
          </div>
        ) : (
          <div className="grid gap-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* دکمه تغییر وضعیت انجام هدف */}
                  <form action={toggleGoalAction}>
                    <input type="hidden" name="goalId" value={goal.id} />
                    <input
                      type="hidden"
                      name="isCompleted"
                      value={goal.isCompleted ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        goal.isCompleted
                          ? "border-brand-green bg-brand-green text-white"
                          : "border-gray-300 hover:border-brand-green"
                      }`}
                    >
                      {goal.isCompleted && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </form>

                  <div>
                    <h3
                      className={`font-semibold ${
                        goal.isCompleted ? "text-dark-gray/40 line-through" : "text-dark-gray"
                      }`}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-dark-gray/60 mt-0.5">{goal.description}</p>
                    )}
                    {goal.targetDate && (
                      <span className="text-[10px] text-brand-green bg-brand-green/10 rounded-full px-2 py-0.5 mt-1 inline-block">
                        تا تاریخ: {new Date(goal.targetDate).toLocaleDateString("fa-IR")}
                      </span>
                    )}
                  </div>
                </div>

                {/* فرم حذف هدف */}
                <form action={deleteGoalAction}>
                  <input type="hidden" name="goalId" value={goal.id} />
                  <button
                    type="submit"
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    حذف
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
