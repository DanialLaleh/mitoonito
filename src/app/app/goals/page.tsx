import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createGoalAction,
  deleteGoalAction,
  toggleGoalCompletedAction,
  createGoalTaskAction
} from "@/app/actions/goals";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  // دریافت تمام اهداف کاربر همراه با تسک‌های متصل به هر هدف
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      tasks: {
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 text-right" dir="rtl">
      {/* هدر صفحه */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#434345]">اهداف من</h1>
        <p className="text-xs text-gray-500 mt-1">توسعه فردی و برنامه‌های بلندمدت میتونی‌تو</p>
      </div>

      {/* فرم ایجاد هدف جدید */}
      <div className="bg-white border border-[#E6E7E8] rounded-2xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#434345] mb-3">تعریف هدف جدید</h2>
        <form action={createGoalAction} className="space-y-3">
          <div>
            <input
              type="text"
              name="title"
              placeholder="مثال: یادگیری Next.js یا کاهش وزن"
              required
              className="w-full px-3 py-2 text-sm border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848]"
            />
          </div>
          <div>
            <textarea
              name="description"
              placeholder="توضیحات اختیاری درباره مسیر رسیدن به هدف..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848] resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#50B848] text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform"
          >
            ایجاد هدف
          </button>
        </form>
      </div>

      {/* لیست اهداف */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">هنوز هدفی تعریف نکرده‌ای دانیال!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const completedTasksCount = goal.tasks.filter((t) => t.isCompleted).length;
            const totalTasksCount = goal.tasks.length;
            const progressPercent = totalTasksCount > 0 
              ? Math.round((completedTasksCount / totalTasksCount) * 100) 
              : 0;

            return (
              <div
                key={goal.id}
                className="bg-white border border-[#E6E7E8] rounded-2xl p-4 shadow-sm space-y-4"
              >
                {/* بخش بالای کارت هدف */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          goal.isCompleted ? "bg-[#50B848]" : "bg-yellow-500"
                        }`}
                      />
                      <h3 className={`text-base font-bold text-[#434345] ${goal.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {goal.title}
                      </h3>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-gray-500 mr-4 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* کنترلرهای هدف */}
                  <div className="flex items-center gap-1">
                    <form action={toggleGoalCompletedAction}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <input type="hidden" name="isCompleted" value={goal.isCompleted ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          goal.isCompleted
                            ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            : "bg-[#9FD18B]/20 text-[#367639] hover:bg-[#9FD18B]/40"
                        }`}
                      >
                        {goal.isCompleted ? "بازگشایی" : "تکمیل"}
                      </button>
                    </form>

                    <form action={deleteGoalAction}>
                      <input type="hidden" name="goalId" value={goal.id} />
                      <button
                        type="submit"
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </div>

                {/* پراگرس بار بر اساس تسک‌های هدف */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>پیشرفت تسک‌ها</span>
                    <span>{progressPercent}% ({completedTasksCount} از {totalTasksCount})</span>
                  </div>
                  <div className="w-full bg-[#E6E7E8] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#50B848] h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* لیست تسک‌های این هدف */}
                {totalTasksCount > 0 && (
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <p className="text-xs font-bold text-gray-500 mb-2">تسک‌های متصل:</p>
                    {goal.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-xs"
                      >
                        <span className={task.isCompleted ? "line-through text-gray-400" : "text-[#434345]"}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(task.date).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* فرم اضافه کردن تسک به صورت مستقیم به این هدف */}
                <div className="border-t border-gray-100 pt-3">
                  <form action={createGoalTaskAction} className="flex gap-2">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <input
                      type="text"
                      name="title"
                      placeholder="تسک جدید برای این هدف..."
                      required
                      className="flex-1 px-2.5 py-1.5 text-xs border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848]"
                    />
                    <input
                      type="date"
                      name="date"
                      className="px-1.5 py-1.5 text-xs border border-[#E6E7E8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#50B848] text-gray-500"
                    />
                    <button
                      type="submit"
                      className="bg-[#367639] text-white px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                    >
                      افزودن تسک
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
